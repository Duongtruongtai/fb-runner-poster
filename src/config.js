import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  let raw;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    console.error("Missing .env file. Copy .env.example to .env and fill in your credentials.");
    process.exit(1);
  }
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const env = loadEnv();

export const PAGE_ID = env.PAGE_ID;
export const PAGE_ACCESS_TOKEN = env.PAGE_ACCESS_TOKEN;
export const GRAPH_API = "https://graph.facebook.com/v21.0";

if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
  console.error("PAGE_ID and PAGE_ACCESS_TOKEN must be set in .env");
  process.exit(1);
}
