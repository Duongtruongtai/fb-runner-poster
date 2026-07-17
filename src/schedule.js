import { schedulePost } from "./facebook.js";
import { takeNextPosts } from "./content.js";

// Golden hours for Vietnamese crypto audience (Vietnam time, UTC+7)
const GOLDEN_HOURS = [
  { hour: 7, minute: 0 }, // morning market check over coffee
  { hour: 12, minute: 0 }, // lunch break scrolling
  { hour: 21, minute: 0 }, // evening prime time, most active hours
];

const VN_UTC_OFFSET_HOURS = 7;
const MIN_LEAD_MINUTES = 15; // Facebook requires scheduled time >= 10 min in the future

const days = Number(process.argv[2]) || 3;
const postsPerDay = Math.min(Number(process.argv[3]) || 1, GOLDEN_HOURS.length);

// Build the list of upcoming golden-hour slots in chronological order
function upcomingSlots(totalNeeded) {
  const slots = [];
  const now = Date.now();
  const minTime = now + MIN_LEAD_MINUTES * 60 * 1000;

  for (let dayOffset = 0; slots.length < totalNeeded && dayOffset < days + 2; dayOffset++) {
    const daySlots = [];
    for (const { hour, minute } of GOLDEN_HOURS) {
      const utcMillis = Date.UTC(
        new Date(now).getUTCFullYear(),
        new Date(now).getUTCMonth(),
        new Date(now).getUTCDate() + dayOffset,
        hour - VN_UTC_OFFSET_HOURS,
        minute
      );
      if (utcMillis >= minTime) daySlots.push(utcMillis);
    }
    slots.push(...daySlots.slice(0, postsPerDay));
  }
  return slots.slice(0, totalNeeded);
}

const totalPosts = days * postsPerDay;
const slots = upcomingSlots(totalPosts);
const posts = takeNextPosts(slots.length);

console.log(`Scheduling ${slots.length} posts (${postsPerDay}/day for ~${days} days)...\n`);

for (let i = 0; i < slots.length; i++) {
  const unixTime = Math.floor(slots[i] / 1000);
  const vnTime = new Date(slots[i] + VN_UTC_OFFSET_HOURS * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16);
  const post = posts[i];
  try {
    const result = await schedulePost(post.message, unixTime);
    console.log(`OK  ${vnTime} (VN) -> post #${post.id} [${post.topic}] id=${result.id}`);
  } catch (err) {
    console.error(`FAIL ${vnTime} (VN) -> post #${post.id}: ${err.message}`);
  }
}

console.log("\nDone. Check: Page > Meta Business Suite > Planner to see scheduled posts.");
