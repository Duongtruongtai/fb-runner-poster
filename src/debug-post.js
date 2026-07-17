// Diagnostic: verifies the page token works for reads, then attempts a minimal
// test post and prints the FULL error object from the Graph API.
import { GRAPH_API, getEnv } from "./config.js";

const { PAGE_ID, PAGE_ACCESS_TOKEN } = getEnv();

const readRes = await fetch(
  `${GRAPH_API}/${PAGE_ID}?fields=id,name,is_published&access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`
);
console.log("READ page:", JSON.stringify(await readRes.json()));

const body = new URLSearchParams({
  message: "Test post from API - se xoa ngay",
  access_token: PAGE_ACCESS_TOKEN,
});
const postRes = await fetch(`${GRAPH_API}/${PAGE_ID}/feed`, { method: "POST", body });
console.log("POST feed:", JSON.stringify(await postRes.json(), null, 2));
