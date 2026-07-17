import { GRAPH_API, getEnv } from "./config.js";

async function graphRequest(method, endpoint, params = {}) {
  const { PAGE_ACCESS_TOKEN } = getEnv();
  const data = new URLSearchParams({ ...params, access_token: PAGE_ACCESS_TOKEN });
  const url = `${GRAPH_API}/${endpoint}`;
  const res =
    method === "GET"
      ? await fetch(`${url}?${data}`)
      : await fetch(url, { method, body: data });
  const json = await res.json();
  if (json.error) {
    const err = new Error(
      `Graph API error: ${json.error.error_user_msg || json.error.message} (code ${json.error.code}${json.error.error_subcode ? `/${json.error.error_subcode}` : ""})`
    );
    err.fb = json.error;
    throw err;
  }
  return json;
}

export async function publishNow(message) {
  return graphRequest("POST", `${getEnv().PAGE_ID}/feed`, { message });
}

// unixTime must be 10 minutes to 75 days in the future (Facebook requirement)
export async function schedulePost(message, unixTime) {
  return graphRequest("POST", `${getEnv().PAGE_ID}/feed`, {
    message,
    published: "false",
    scheduled_publish_time: String(unixTime),
  });
}

export async function listScheduledPosts() {
  return graphRequest("GET", `${getEnv().PAGE_ID}/scheduled_posts`, {
    fields: "id,message,scheduled_publish_time",
  });
}

export async function cancelScheduledPost(postId) {
  return graphRequest("DELETE", postId);
}

export async function getPageInfo() {
  return graphRequest("GET", getEnv().PAGE_ID, { fields: "id,name,fan_count,link" });
}
