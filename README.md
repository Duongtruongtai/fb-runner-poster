# FB Page Poster

Auto content writer and post scheduler for the **Bien Dong Crypto** Facebook page (crypto knowledge: indicators, market cycles, risk management, news commentary). Contains a Vietnamese content bank and schedules posts into golden hours using Facebook's native scheduled posts (no server needed — Facebook publishes them for you).

> The previous version of this repo targeted a runner page; that content bank is kept at `content/posts-runner.json`.

## Setup

1. Requires Node.js 18+.
2. Copy `.env.example` to `.env` and fill in your Page ID and Page Access Token, **or** run:

```bash
node src/setup-page-token.js <USER_ACCESS_TOKEN> [PAGE_ID]
```

This exchanges a user token (with `pages_manage_posts` + `pages_read_engagement`) for the page token and writes `.env` for you. Use a **long-lived** user token (Access Token Debugger -> Extend Access Token) so the resulting page token effectively never expires.

## Usage

```bash
# Publish the next post from the content bank immediately
npm run post

# Schedule posts into golden hours (7:00, 12:00, 21:00 Vietnam time)
npm run schedule              # 1 post/day for 3 days
npm run schedule -- 7 2       # 2 posts/day for 7 days

# List currently scheduled posts
npm run list

# Diagnose posting problems (prints the full Graph API error)
node src/debug-post.js
```

Content lives in `content/posts.json` — add more posts there anytime. The rotation state (which posts were already used) is stored in `data/state.json` and resets automatically when the bank is exhausted.

## Golden hours

Defined in `src/schedule.js` (`GOLDEN_HOURS`), Vietnam time:

- 07:00 — morning market check
- 12:00 — lunch break
- 21:00 — evening prime time

## Troubleshooting

- **Error code 200**: token is missing `pages_manage_posts` — regenerate it with that permission.
- **Error code 190**: token expired — generate a new one and extend it.
- **Error subcode 2424009** ("Your account is restricted"): the Facebook account itself is restricted from posting via API — appeal at facebook.com/accountquality before retrying.
