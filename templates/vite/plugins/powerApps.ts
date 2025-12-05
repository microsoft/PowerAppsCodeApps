import type { Plugin, ViteDevServer } from "vite";
import pc from "picocolors";
import powerConfig from "../power.config.json";

export const powerAppsCorsOrigins = [
  // vite default localhost origins
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
  // apps.powerapps.com
  /^https:\/\/apps\.powerapps\.com$/,
  // apps.*.powerapps.com
  /^https:\/\/apps\.(?:[^.]+\.)*powerapps\.com$/,
];

const powerConfigPath = "__vite_powerapps_plugin__/power.config.json";

export function powerApps(): Plugin {
  return {
    name: "powerApps",
    apply: "serve",
    configureServer(server) {
      printLocalPlayUrl(server);
      servePowerConfig(server);
    },
  };
}

// Prints the apps.powerapps.com play URL to the console
function printLocalPlayUrl(server: ViteDevServer) {
  server.httpServer?.on("listening", () => {
    const environmentId = powerConfig?.environmentId;
    if (!environmentId) {
      server.config.logger.error(
        "[powerApps] environmentId is not defined in power.config.json"
      );
      return;
    }

    const baseUrl = server.resolvedUrls?.local?.[0];
    if (!baseUrl) {
      server.config.logger.error(
        "[powerApps] Unable to determine vite dev server URL"
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
    server.config.logger.info(`  ${pc.magentaBright("Power Apps Vite Plugin")}\n`);
    server.config.logger.info(`  ${pc.magenta("➜")}  Local Play:   ${playUrl}`);
  });
}


// Serves the power.config.json content at a specific path to be accessed by apps.powerapps.com
function servePowerConfig(server: ViteDevServer) {
  server.middlewares.use(`/${powerConfigPath}`, (_req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(powerConfig));
  });
}
