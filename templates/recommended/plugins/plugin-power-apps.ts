import { resolve } from 'path'
import fs from 'node:fs'
import fsp from "node:fs/promises"
import type { Plugin, ViteDevServer } from "vite";
import pc from "picocolors";

const ROUTE = "/power.config.json";
const FILE_PATH = resolve(process.cwd(), "power.config.json");

export const POWER_APPS_CORS_ORIGINS = [
  // vite default localhost origins
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
  // apps.powerapps.com
  /^https:\/\/apps\.powerapps\.com$/,
  // apps.*.powerapps.com
  /^https:\/\/apps\.(?:[^.]+\.)*powerapps\.com$/,
];

export function powerApps(): Plugin {
  return {
    name: "powerapps",
    apply: "serve", // dev-only
    configureServer(server: ViteDevServer) {
      configureHttpServerStartListener(server);
      configureMiddleware(server);
    },
  };
}

function configureHttpServerStartListener(server: ViteDevServer): void {
  // When the server starts listening, print the Power Apps launch URL
  server.httpServer?.once("listening", async () => {
    let environmentId = "";

    try {
      // If power.config.json does not exist, do nothing
      if (!fs.existsSync(FILE_PATH)) {
        return;
      }
      
      // Otherwise set the environment ID
      const txt = await fsp.readFile(FILE_PATH, "utf-8");
      const powerConfig = JSON.parse(txt);
      environmentId = powerConfig?.environmentId;

      // If environmentId is not found, log an error and return
      if (!environmentId) {
        server.config.logger.error(`[power-apps] Property environmentId not found in ${FILE_PATH}`);
        return;
      }

    } catch (err) {
      // If there was an error reading or parsing the file, log an error and return
      server.config.logger.error(`[power-apps] Failed to read or parse ${FILE_PATH}`);
      server.config.logger.error(`[power-apps] ${String(err)}`);
      return;
    }

    // Construct the vite server URL
    const urls = server.resolvedUrls?.local ?? [];
    const baseUrl = urls[0];

    // If we can't determine the dev server URL (should never happen), log an error and return
    if (!baseUrl) {
      server.config.logger.error("[power-apps] Could not determine vite dev server URL");
      return;
    }

    // Otherwise, construct the apps.powerapps.com URL
    // NOTE: we should be URL-encoding these parameters, but Power Apps expects them unencoded
    const localAppUrl = `${baseUrl}`;
    const localConnectionUrl = `${baseUrl.replace(/\/$/, "") + ROUTE}`;

    const playUrl =
      `${pc.magenta("https://apps.powerapps.com/play/e/") + pc.magentaBright(environmentId) + pc.magenta("/a/local")}` +
      `${pc.magenta("?_localAppUrl=") + pc.magentaBright(localAppUrl)}` +
      `${pc.magenta("&_localConnectionUrl=") + pc.magentaBright(localConnectionUrl)}` +
      `${pc.reset("")}`;

    // Nicely formatted console output
    server.config.logger.info("\n");
    server.config.logger.info("Power Apps Local:\n");
    server.config.logger.info(`${playUrl}\n`);
  });
}

function configureMiddleware(server: ViteDevServer): void {
  server.middlewares.use(async (req, res, next) => {
    if (!req.url) {
      return next();
    }

    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname !== ROUTE) {
      return next();
    }

    try {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");

      if (!fs.existsSync(FILE_PATH)) {
        // If power.config.json does not exist, log a warning and return a 404
        server.config.logger.warn(`[power-apps] File ${FILE_PATH} not found`);
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "power.config.json not found" }));
      }

      // Otherwise, read and return the file contents
      const txt = await fsp.readFile(FILE_PATH, "utf-8");
      const json = JSON.stringify(JSON.parse(txt));
      res.statusCode = 200;
      res.end(json);

    } catch (err) {
      // If there was an error reading or parsing the file, log an error and return a 500
      server.config.logger.error(`[power-apps] Failed to read or parse ${FILE_PATH}`);
      server.config.logger.error(`[power-apps] ${String(err)}`);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Failed to read or parse power.config.json" }));
    }
  });
}
