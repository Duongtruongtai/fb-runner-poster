// Exchanges a user access token for a page access token and saves it to .env.
// The page token itself is never returned to callers' output paths.
import { writeFileSync } from "fs";
import path from "path";
import { ROOT_DIR, GRAPH_API } from "./config.js";

const DEFAULT_PAGE_ID = "1141619055709724"; // Bien Dong Crypto

export async function exchangeAndSavePageToken(userToken, pageId = DEFAULT_PAGE_ID) {
  const res = await fetch(
    `${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(userToken)}`
  );
  const json = await res.json();
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);

  const pages = json.data || [];
  const page = pages.find((p) => p.id === pageId) || (pages.length === 1 ? pages[0] : null);
  if (!page) {
    throw new Error(
      `Page ${pageId} not found among managed pages (${pages.map((p) => `${p.name}=${p.id}`).join(", ") || "none"}).`
    );
  }

  // Look up the page token's expiry (best effort)
  let expiresAt = null;
  try {
    const dbg = await fetch(
      `${GRAPH_API}/debug_token?input_token=${encodeURIComponent(page.access_token)}&access_token=${encodeURIComponent(userToken)}`
    );
    const dbgJson = await dbg.json();
    if (typeof dbgJson.data?.expires_at === "number") expiresAt = dbgJson.data.expires_at;
  } catch {
    // ignore - expiry stays unknown
  }

  writeFileSync(
    path.join(ROOT_DIR, ".env"),
    `PAGE_ID=${page.id}\nPAGE_ACCESS_TOKEN=${page.access_token}\nTOKEN_EXPIRES_AT=${expiresAt ?? ""}\n`
  );

  return { pageId: page.id, pageName: page.name, expiresAt };
}
