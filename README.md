To test the app quickly, access this url: https://koda-app-five.vercel.app/
To quickly try it, use:
Email: user@sample.com
Password: 12345678


## Setup Instructions

This project uses Bun locally.

Install dependencies:

```bash
bun install
```

Create your local environment file:

```bash
cp .env.example .env
```

Use `.env.example` as the source of required local values. The local database, direct database, Better Auth URL, and Redis URL are already set for Docker-based development. Generate your own `BETTER_AUTH_SECRET` and put it in `.env`:

```bash
bun -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Start the local services and app:

```bash
docker compose up -d
bun dev
```

Run database migrations after Postgres is running:

```bash
bun run db:migrate
```

Optional seed data (Note: change the SEED_USER_EMAIL on seed.ts with your own email on app):

```bash
bun run db:seed
```

Open `http://localhost:3000`.

## Technical Reflection

**1. Why did you choose this implementation approach?**

A single full-stack Next.js app was the fastest, lowest-complexity fit for this
scope. Keeping the frontend and API in one codebase avoids the overhead of
standing up and wiring a separate backend service, sharing types and validation
end to end instead. It's also the stack I'm most experienced with, so I could
spend the time on product quality rather than setup.

**2. What tradeoffs did you make?**

The main one is that the project list is unpaginated — it loads the full set at
once. That's fine for the assessment's data volume but won't scale. The
straightforward defenses are cursor-based pagination on the API (stable under
inserts, unlike offset paging) plus list virtualization on the client so render
cost stays flat as the dataset grows.

**3. What would you improve if given additional time?**

Pagination (per above) is the first item. Beyond that, I'd add observability —
Sentry for error tracking and structured logging — to make the app easier to
operate and debug in production, along with broader test coverage on the API and
validation paths.

**4. What was the most challenging part of this assessment?**

Nothing was a hard blocker. The part that took the most care was the responsive
UI — sharing one form across a desktop side sheet and a mobile bottom drawer
while keeping layout and scrolling correct in both — and getting caching and
rate limiting to behave consistently with the data layer.

**5. Did you use AI tools during development?**

Yes — primarily Cursor, Claude, and Codex.

* **Which tools?** Cursor, Claude, and Codex. The specific brand isn't important;
  I use whichever fits the moment.
* **How were they used?** To accelerate development: brainstorming, drafting a
  plan, then executing it — writing code, installing dependencies, checking
  documentation, and scaffolding features. The architecture, technology choices,
  and design decisions are all my own.
