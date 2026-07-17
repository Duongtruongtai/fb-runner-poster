import { schedulePost } from "./facebook.js";
import { takeNextPosts } from "./content.js";
import { upcomingSlots, formatVN, GOLDEN_HOURS } from "./golden-hours.js";

const days = Number(process.argv[2]) || 3;
const postsPerDay = Math.min(Number(process.argv[3]) || 1, GOLDEN_HOURS.length);

const slots = upcomingSlots(days * postsPerDay, postsPerDay, days + 2);
const posts = takeNextPosts(slots.length);

console.log(`Scheduling ${slots.length} posts (${postsPerDay}/day for ~${days} days)...\n`);

for (let i = 0; i < slots.length; i++) {
  const unixTime = Math.floor(slots[i] / 1000);
  const post = posts[i];
  try {
    const result = await schedulePost(post.message, unixTime);
    console.log(`OK  ${formatVN(slots[i])} (VN) -> post #${post.id} [${post.topic}] id=${result.id}`);
  } catch (err) {
    console.error(`FAIL ${formatVN(slots[i])} (VN) -> post #${post.id}: ${err.message}`);
  }
}

console.log("\nDone. Check: Page > Meta Business Suite > Planner to see scheduled posts.");
