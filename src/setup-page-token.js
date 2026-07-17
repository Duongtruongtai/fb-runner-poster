// Exchanges a user access token for the page access token and writes .env.
// Usage: node src/setup-page-token.js <USER_ACCESS_TOKEN>
// The page token is written to .env only — never printed to stdout.
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAPH_API = "https://graph.facebook.com/v21.0";
// Bien Dong Crypto page; override with the second CLI argument if needed
const TARGET_PAGE_ID = process.argv[3] || "1141619055709724";

const userToken = process.argv[2];
if (!userToken) {
  console.error("Usage: node src/setup-page-token.js <USER_ACCESS_TOKEN> [PAGE_ID]");
  process.exit(1);
}

const res = await fetch(
  `${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(userToken)}`
);
const json = await res.json();
if (json.error) {
  console.error(`Graph API error: ${json.error.message}`);
  process.exit(1);
}

const page = (json.data || []).find((p) => p.id === TARGET_PAGE_ID);
if (!page) {
  console.error(`Page ${TARGET_PAGE_ID} not found among managed pages.`);
  process.exit(1);
}

// Check the page token's expiry via debug_token
const dbg = await fetch(
  `${GRAPH_API}/debug_token?input_token=${encodeURIComponent(page.access_token)}&access_token=${encodeURIComponent(userToken)}`
);
const dbgJson = await dbg.json();
const expiresAt = dbgJson.data?.expires_at;
const expiry = expiresAt === 0 ? "never" : new Date(expiresAt * 1000).toISOString();

writeFileSync(
  path.join(ROOT_DIR, ".env"),
  `PAGE_ID=${page.id}\nPAGE_ACCESS_TOKEN=${page.access_token}\n`
);

console.log(`Wrote .env for page "${page.name}" (${page.id}). Page token expires: ${expiry}`);
