import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, "..");
export const GRAPH_API = "https://graph.facebook.com/v21.0";

// Reads .env fresh on every call so the server picks up token updates
// without a restart.
export function getEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  let raw;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    throw new Error("Missing .env file. Copy .env.example to .env and fill in your credentials.");
  }
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2];
  }
  if (!env.PAGE_ID || !env.PAGE_ACCESS_TOKEN) {
    throw new Error("PAGE_ID and PAGE_ACCESS_TOKEN must be set in .env");
  }
  return env;
}
