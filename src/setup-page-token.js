// CLI wrapper around the token exchange.
// Usage: node src/setup-page-token.js <USER_ACCESS_TOKEN> [PAGE_ID]
// The page token is written to .env only — never printed to stdout.
import { exchangeAndSavePageToken } from "./token.js";

const userToken = process.argv[2];
if (!userToken) {
  console.error("Usage: node src/setup-page-token.js <USER_ACCESS_TOKEN> [PAGE_ID]");
  process.exit(1);
}

const { pageId, pageName, expiresAt } = await exchangeAndSavePageToken(userToken, process.argv[3]);
const expiry = expiresAt === 0 ? "never" : expiresAt ? new Date(expiresAt * 1000).toISOString() : "unknown";
console.log(`Wrote .env for page "${pageName}" (${pageId}). Page token expires: ${expiry}`);
