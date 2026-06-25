# Project Agent Guide

## What The Project Does

- KodaTrack is a Next.js app for authenticated users to manage client projects.
- Auth uses Better Auth with Prisma/Postgres.
- Project APIs use Redis-compatible caching and rate limiting.

## Where Things Live

- `src/app`: Next.js pages, layouts, and API route handlers.
- `src/components`: UI and product components.
- `src/lib`: auth, Prisma, API helpers, Redis/cache/rate-limit utilities, services, and validations.
- `prisma`: schema, migrations, generated client, seed script, and seed data.
- `.github`: CI and Vercel environment automation.
- `docker-compose.yml`: local Postgres and Redis services.

## How Work Gets Done

- Use Bun locally: `bun install`.
- Copy `.env.example` to `.env` and set your own `BETTER_AUTH_SECRET`.
- Start local services with `docker compose up -d`; run the app with `bun dev`.
- Run `bun run db:migrate` after schema changes; use `bun run db:seed` for sample data.
- Validate focused changes with `bunx --bun biome check <paths>`; use `bun run lint` for repo-wide checks.
- Keep `.env` private; keep `.env.example` committed when env requirements change.
- Keep `AGENTS.md` and `CLAUDE.md` short and in sync.
