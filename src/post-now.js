import { publishNow } from "./facebook.js";
import { takeNextPosts } from "./content.js";

const [post] = takeNextPosts(1);
console.log(`Publishing post #${post.id} (${post.topic})...`);
const result = await publishNow(post.message);
console.log(`Published! Post ID: ${result.id}`);
console.log(`Link: https://www.facebook.com/${result.id}`);
