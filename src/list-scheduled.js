import { listScheduledPosts } from "./facebook.js";

const result = await listScheduledPosts();
const posts = result.data || [];

if (posts.length === 0) {
  console.log("No scheduled posts.");
} else {
  console.log(`${posts.length} scheduled post(s):\n`);
  for (const post of posts) {
    const vnTime = new Date((post.scheduled_publish_time + 7 * 3600) * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 16);
    const preview = (post.message || "").split("\n")[0].slice(0, 60);
    console.log(`- ${vnTime} (VN) | ${preview}... | id=${post.id}`);
  }
}
