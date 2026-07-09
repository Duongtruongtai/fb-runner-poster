import { GRAPH_API, PAGE_ID, PAGE_ACCESS_TOKEN } from "./config.js";

async function graphPost(endpoint, params) {
  const body = new URLSearchParams({ ...params, access_token: PAGE_ACCESS_TOKEN });
  const res = await fetch(`${GRAPH_API}/${endpoint}`, { method: "POST", body });
  const json = await res.json();
  if (json.error) {
    throw new Error(`Graph API error: ${json.error.message} (code ${json.error.code})`);
  }
  return json;
}

async function graphGet(endpoint, params = {}) {
  const query = new URLSearchParams({ ...params, access_token: PAGE_ACCESS_TOKEN });
  const res = await fetch(`${GRAPH_API}/${endpoint}?${query}`);
  const json = await res.json();
  if (json.error) {
    throw new Error(`Graph API error: ${json.error.message} (code ${json.error.code})`);
  }
  return json;
}

export async function publishNow(message) {
  return graphPost(`${PAGE_ID}/feed`, { message });
}

// unixTime must be 10 minutes to 75 days in the future (Facebook requirement)
export async function schedulePost(message, unixTime) {
  return graphPost(`${PAGE_ID}/feed`, {
    message,
    published: "false",
    scheduled_publish_time: String(unixTime),
  });
}

export async function listScheduledPosts() {
  return graphGet(`${PAGE_ID}/scheduled_posts`, {
    fields: "id,message,scheduled_publish_time",
  });
}
