## How to get it running now

From the repo root:

1. **Configure the database URL**

    - If using Supabase (recommended for “clone and run”):
        - Create a free Supabase project.
        - Go to Database → Connection string → copy the `postgres://…` string.
        - In .env, set:  
          `DATABASE_URL=[connection-string]`
    - If using local Postgres instead:
        - Start Postgres (e.g., database microblog).
        - Set `DATABASE_URL` in .env, for example:  
          `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microblog?schema=public"`

2. **Run Prisma migrations**

    ```bash
    cd microblog
    npx prisma migrate dev --name init
    ```

    This creates tables for users, posts, likes, replies, and sessions.

3. **Generate the Prisma client**

    After cloning or pulling the repo you should (re)generate the Prisma client so imports from `@/generated/prisma/client` work:

    ```bash
    npx prisma generate
    ```

4. **Start the dev server**

    ```bash
    npm run dev
    ```

    Then open http://localhost:3000 in your browser.
