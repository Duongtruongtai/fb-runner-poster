import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { ROOT_DIR } from "./config.js";

const POSTS_PATH = path.join(ROOT_DIR, "content", "posts.json");
const STATE_PATH = path.join(ROOT_DIR, "data", "state.json");

export function loadPosts() {
  return JSON.parse(readFileSync(POSTS_PATH, "utf8"));
}

function savePosts(posts) {
  writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2));
}

export function loadState() {
  if (!existsSync(STATE_PATH)) return { usedIds: [] };
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

function saveState(state) {
  mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function getPostById(id) {
  return loadPosts().find((p) => p.id === Number(id));
}

export function addPost({ topic, message }) {
  const posts = loadPosts();
  const id = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const post = { id, topic: topic || "general", message };
  posts.push(post);
  savePosts(posts);
  return post;
}

export function updatePost(id, { topic, message }) {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === Number(id));
  if (!post) throw new Error(`Post ${id} not found`);
  if (topic !== undefined) post.topic = topic;
  if (message !== undefined) post.message = message;
  savePosts(posts);
  return post;
}

export function deletePost(id) {
  const posts = loadPosts();
  const idx = posts.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error(`Post ${id} not found`);
  posts.splice(idx, 1);
  savePosts(posts);
  const state = loadState();
  state.usedIds = state.usedIds.filter((usedId) => usedId !== Number(id));
  saveState(state);
}

export function markUsed(id) {
  const state = loadState();
  if (!state.usedIds.includes(Number(id))) state.usedIds.push(Number(id));
  saveState(state);
}

// Returns the next unused posts; resets the rotation when the bank is exhausted
export function takeNextPosts(count) {
  const posts = loadPosts();
  const state = loadState();
  const taken = [];
  for (let i = 0; i < count; i++) {
    let available = posts.filter((p) => !state.usedIds.includes(p.id));
    if (available.length === 0) {
      state.usedIds = [];
      available = posts;
    }
    const post = available[0];
    state.usedIds.push(post.id);
    taken.push(post);
  }
  saveState(state);
  return taken;
}
