import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { ROOT_DIR } from "./config.js";

const POSTS_PATH = path.join(ROOT_DIR, "content", "posts.json");
const STATE_PATH = path.join(ROOT_DIR, "data", "state.json");

export function loadPosts() {
  return JSON.parse(readFileSync(POSTS_PATH, "utf8"));
}

function loadState() {
  if (!existsSync(STATE_PATH)) return { usedIds: [] };
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

function saveState(state) {
  mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
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
