# Microblog

This is a simple Twitter-style microblog built with Next.js 16 (App Router), Prisma, and PostgreSQL (Supabase-friendly).

## Getting Started

For full environment and database setup instructions, see [GET_STARTED.md](GET_STARTED.md). In short:

1. Configure `DATABASE_URL` in `.env` (Supabase or local Postgres).
2. Run Prisma migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000 to use the app.

## Automated Tests

This project uses Vitest for automated tests.

- Config: [vitest.config.ts](vitest.config.ts)
- API tests:
  - [tests/api/auth.test.ts](tests/api/auth.test.ts) — register/login flows
  - [tests/api/posts.test.ts](tests/api/posts.test.ts) — posting + feed retrieval
  - [tests/api/likes.test.ts](tests/api/likes.test.ts) — like/unlike flows
  - [tests/api/replies.test.ts](tests/api/replies.test.ts) — replies flows
- Component tests:
  - [tests/components/post-actions.test.tsx](tests/components/post-actions.test.tsx) — like/unlike and reply UI behavior

Each test file emits structured `console.info` logs (for example `[auth.test]`, `[posts.test]`, `[likes.test]`, `[replies.test]`, `[post-actions.test]`) so you can see which flows ran and how.

To run the full suite once and capture logs:

```bash
npm test -- --run > test-log.txt 2>&1
```

The resulting `test-log.txt` can be included with your submission.

## Notes

- The global feed and posting require a logged-in user.
- Replies are displayed under each post (up to 2 by default, with an option to show more).
- Interactive controls such as like, reply, post, and logout buttons have explicit pointer cursors for clearer click affordance.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
