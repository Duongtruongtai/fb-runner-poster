# FB Runner Poster

Auto content writer and post scheduler for the **Runner Com VN** Facebook page. Contains a bank of Vietnamese running-tips posts and schedules them into golden hours using Facebook's native scheduled posts (no server needed — Facebook publishes them for you).

## Setup

1. Requires Node.js 18+.
2. Copy `.env.example` to `.env` and fill in your Page ID and Page Access Token.

> Get a Page Access Token: Graph API Explorer -> your app -> User token with `pages_manage_posts` + `pages_read_engagement` -> call `/me/accounts` to get the page token.

## Usage

```bash
# Publish the next post from the content bank immediately
npm run post

# Schedule posts into golden hours (5:30, 11:30, 20:00 Vietnam time)
npm run schedule              # 1 post/day for 3 days
npm run schedule -- 7 2       # 2 posts/day for 7 days

# List currently scheduled posts
npm run list
```

Content lives in `content/posts.json` — add more posts there anytime. The rotation state (which posts were already used) is stored in `data/state.json` and resets automatically when the bank is exhausted.

## Golden hours

Defined in `src/schedule.js` (`GOLDEN_HOURS`), Vietnam time:

- 05:30 — early-morning runners
- 11:30 — lunch break
- 20:00 — evening prime time
