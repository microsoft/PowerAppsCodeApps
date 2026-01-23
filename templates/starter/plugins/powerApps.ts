import type { Plugin, ViteDevServer } from "vite";
import pc from "picocolors";
import * as fs from "fs";
import * as path from "path";

const powerAppsCorsOrigins = [
  // vite default localhost origins
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
  // apps.powerapps.com
  /^https:\/\/apps\.powerapps\.com$/,
  // apps.*.powerapps.com
  /^https:\/\/apps\.(?:[^.]+\.)*powerapps\.com$/,
];

const powerConfigPath = "__vite_powerapps_plugin__/power.config.json";

interface PowerConfig {
  appId?: string;
  appDisplayName?: string;
  description?: string | null;
  environmentId: string;
  buildPath?: string;
  buildEntryPoint?: string;
  logoPath?: string;
  localAppUrl?: string;
  connectionReferences?: unknown;
  databaseReferences?: unknown;
}

export function powerApps(): Plugin {
  return {
    name: "powerApps",
    apply: "serve",
    config() {
      // Automatically inject CORS configuration needed for Vite 7+
      return {
        server: {
          cors: {
            origin: powerAppsCorsOrigins,
          },
        },
      };
    },
    configureServer(server) {
      printLocalPlayUrl(server);
      servePowerConfig(server);
      watchPowerConfig(server);
    },
  };
}

function getLocalBaseUrl(server: ViteDevServer): string | null {
  // Vite 6+
  if (server.resolvedUrls?.local?.[0]) {
    return server.resolvedUrls.local[0];
  }
  // In Vite 5 and below, resolvedUrls may not be available, fallback to httpServer address
  const address = server.httpServer!.address();
  if (typeof address === "string") {
    return address;
  }
  if (typeof address === "object" && address !== null) {
    const { address: rawHost, port } = address;
    const host = rawHost === "::1" ? "localhost" : rawHost;
    const https = server.config.server.https;
    return `${https ? "https" : "http"}://${host}:${port}/`;
  }
  return null;
}

// Cache for power config to avoid repeated file reads
let cachedPowerConfig: PowerConfig | null = null;

// Type guard to validate PowerConfig structure
function isPowerConfig(obj: unknown): obj is PowerConfig {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "environmentId" in obj &&
    typeof (obj as PowerConfig).environmentId === "string"
  );
}

function getPowerConfig(server: ViteDevServer): PowerConfig {
  if (cachedPowerConfig) {
    return cachedPowerConfig;
  }

  const configPath = path.join(server.config.root, "power.config.json");

  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(configContent);

    if (!isPowerConfig(parsed)) {
      throw new Error(
        "Invalid power.config.json structure. Missing environmentId.",
      );
    }

    cachedPowerConfig = parsed;
    return parsed;
  } catch (error) {
    // Handle specific error types
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `Missing file. Ensure you have run 'pac code init' first. power.config.json expected at ${configPath}.`,
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in power.config.json: ${error.message}`);
    }
    throw error;
  }
}

function watchPowerConfig(server: ViteDevServer) {
  const configPath = path.join(server.config.root, "power.config.json");
  server.watcher.add(configPath);
  server.watcher.on("change", (file) => {
    if (file === configPath) {
      server.config.logger.info(
        pc.yellow(
          "[powerApps] power.config.json changed, restarting server...",
        ),
      );
      // Clear cache so new config is loaded
      cachedPowerConfig = null;
      server.restart();
    }
  });
}

// Prints the apps.powerapps.com play URL to the console
function printLocalPlayUrl(server: ViteDevServer) {
  server.httpServer?.on("listening", () => {
    let powerConfig: PowerConfig;
    try {
      powerConfig = getPowerConfig(server);
    } catch (error) {
      server.config.logger.error(
        pc.red(
          `[powerApps] Error loading power.config.json:\n            ⤷${(error as Error).message ?? error}`,
        ),
      );
      return;
    }
    const environmentId = powerConfig.environmentId;
    if (!environmentId) {
      server.config.logger.error(
        "[powerApps] environmentId is not defined in power.config.json",
      );
      return;
    }

    const baseUrl = getLocalBaseUrl(server);
    if (!baseUrl) {
      server.config.logger.error(
        "[powerApps] Unable to determine vite dev server URL",
      );
      return;
    }

    const localAppUrl = `${baseUrl}`;
    const localConnectionUrl = `${baseUrl}${powerConfigPath}`;

    const playUrl =
      `${
        pc.magenta("https://apps.powerapps.com/play/e/") +
        pc.magentaBright(environmentId) +
        pc.magenta("/a/local")
      }` +
      `${pc.magenta("?_localAppUrl=") + pc.magentaBright(localAppUrl)}` +
      `${
        pc.magenta("&_localConnectionUrl=") +
        pc.magentaBright(localConnectionUrl)
      }` +
      `${pc.reset("")}`;

    // Nicely formatted console output
    server.config.logger.info(
      `  ${pc.magentaBright("Power Apps Vite Plugin")}\n`,
    );
    server.config.logger.info(`  ${pc.magenta("➜")}  Local Play:   ${playUrl}`);
  });
}

// Serves the power.config.json content at a specific path to be accessed by apps.powerapps.com
function servePowerConfig(server: ViteDevServer) {
  server.middlewares.use(`/${powerConfigPath}`, (req, res) => {
    // Manual CORS headers are needed for Vite 6 and below
    const origin = req.headers.origin;
    if (
      origin &&
      powerAppsCorsOrigins.some((pattern) => pattern.test(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    let powerConfig: PowerConfig;
    try {
      powerConfig = getPowerConfig(server);
    } catch (error) {
      server.config.logger.error(
        pc.red(
          `[powerApps] Error serving power.config.json:\n            ⤷${(error as Error).message ?? error}`,
        ),
      );
      // Player can sometimes work without power.config.json
      res.end();
      return;
    }
    res.end(JSON.stringify(powerConfig));
  });
}
