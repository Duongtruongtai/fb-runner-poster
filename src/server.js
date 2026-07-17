// Local management dashboard for the Facebook page poster.
// Run: npm run web  ->  http://localhost:3456
// The access token stays in .env on this machine; the browser never sees it.
import http from "http";
import { readFileSync } from "fs";
import path from "path";
import { ROOT_DIR, getEnv } from "./config.js";
import {
  publishNow,
  schedulePost,
  listScheduledPosts,
  cancelScheduledPost,
  getPageInfo,
} from "./facebook.js";
import {
  loadPosts,
  loadState,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  markUsed,
  takeNextPosts,
} from "./content.js";
import { upcomingSlots, GOLDEN_HOURS } from "./golden-hours.js";
import { exchangeAndSavePageToken } from "./token.js";

const PORT = 3456;
const INDEX_HTML = path.join(ROOT_DIR, "public", "index.html");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  // ---- status ----
  if (route === "GET /api/status") {
    const env = getEnv();
    const expiresAt = env.TOKEN_EXPIRES_AT ? Number(env.TOKEN_EXPIRES_AT) : null;
    let page = null;
    let tokenError = null;
    try {
      page = await getPageInfo();
    } catch (err) {
      tokenError = err.message;
    }
    return json(res, 200, {
      page,
      pageId: env.PAGE_ID,
      tokenExpiresAt: expiresAt,
      tokenError,
      goldenHours: GOLDEN_HOURS,
      bankSize: loadPosts().length,
      usedIds: loadState().usedIds,
    });
  }

  // ---- content bank ----
  if (route === "GET /api/posts") {
    return json(res, 200, { posts: loadPosts(), usedIds: loadState().usedIds });
  }
  if (route === "POST /api/posts") {
    const { topic, message } = await readBody(req);
    if (!message?.trim()) return json(res, 400, { error: "message is required" });
    return json(res, 200, { post: addPost({ topic, message }) });
  }
  const postMatch = url.pathname.match(/^\/api\/posts\/(\d+)$/);
  if (postMatch && req.method === "PUT") {
    const { topic, message } = await readBody(req);
    return json(res, 200, { post: updatePost(postMatch[1], { topic, message }) });
  }
  if (postMatch && req.method === "DELETE") {
    deletePost(postMatch[1]);
    return json(res, 200, { ok: true });
  }

  // ---- publishing ----
  if (route === "POST /api/post-now") {
    const { postId } = await readBody(req);
    const post = getPostById(postId);
    if (!post) return json(res, 404, { error: `Post ${postId} not found` });
    const result = await publishNow(post.message);
    markUsed(post.id);
    return json(res, 200, { id: result.id, link: `https://www.facebook.com/${result.id}` });
  }

  if (route === "POST /api/schedule-one") {
    const { postId, unixTime } = await readBody(req);
    const post = getPostById(postId);
    if (!post) return json(res, 404, { error: `Post ${postId} not found` });
    if (!unixTime || unixTime * 1000 < Date.now() + 10 * 60 * 1000) {
      return json(res, 400, { error: "Scheduled time must be at least 10 minutes in the future" });
    }
    const result = await schedulePost(post.message, Math.floor(unixTime));
    markUsed(post.id);
    return json(res, 200, { id: result.id });
  }

  if (route === "POST /api/schedule-bulk") {
    const { days = 3, perDay = 1 } = await readBody(req);
    const slots = upcomingSlots(days * perDay, Math.min(perDay, GOLDEN_HOURS.length), days + 2);
    const posts = takeNextPosts(slots.length);
    const results = [];
    for (let i = 0; i < slots.length; i++) {
      const post = posts[i];
      try {
        const r = await schedulePost(post.message, Math.floor(slots[i] / 1000));
        results.push({ ok: true, postId: post.id, topic: post.topic, time: slots[i], id: r.id });
      } catch (err) {
        results.push({ ok: false, postId: post.id, topic: post.topic, time: slots[i], error: err.message });
      }
    }
    return json(res, 200, { results });
  }

  // ---- scheduled posts on Facebook ----
  if (route === "GET /api/scheduled") {
    const result = await listScheduledPosts();
    return json(res, 200, { posts: result.data || [] });
  }
  const cancelMatch = url.pathname.match(/^\/api\/scheduled\/([\d_]+)$/);
  if (cancelMatch && req.method === "DELETE") {
    await cancelScheduledPost(cancelMatch[1]);
    return json(res, 200, { ok: true });
  }

  // ---- token update ----
  if (route === "POST /api/token") {
    const { userToken, pageId } = await readBody(req);
    if (!userToken?.trim()) return json(res, 400, { error: "userToken is required" });
    const info = await exchangeAndSavePageToken(userToken.trim(), pageId?.trim() || undefined);
    return json(res, 200, info);
  }

  return json(res, 404, { error: `Unknown route: ${route}` });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else if (url.pathname === "/" || url.pathname === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(readFileSync(INDEX_HTML));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  } catch (err) {
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
