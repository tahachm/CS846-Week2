# Microblogging Web Application – Requirements

## Functional Requirements

-   **User registration**: Users can create an account with email, username, and password.
-   **Login/logout**: Users can log in and log out using email and password.
-   **User profile management**:
    -   View a user profile containing username, display name, bio, join date.
    -   View all posts authored by a specific user in reverse chronological order.
-   **Post creation**:
    -   Authenticated users can create short text posts.
    -   Each post has a maximum length (e.g., 280 characters) enforced on both client and server.
-   **Global feed**:
    -   View a global, chronological feed of posts from all users.
    -   Feed is ordered by creation time (newest first) and supports pagination.
-   **Likes**:
    -   Authenticated users can like a post.
    -   A user can like a given post at most once.
    -   Users can unlike a post they previously liked.
    -   Each post shows its like count and whether the current user has liked it.
-   **Replies (one level deep)**:
    -   Authenticated users can reply to a post.
    -   Replies are limited to one level of depth (no replies-to-replies threads).
    -   Each post can display its direct replies in chronological order.
-   **Profile and feed navigation**:
    -   From any post, users can navigate to the author’s profile.
    -   From a profile, users can navigate back to the global feed.

## Non-Functional Requirements

-   **Architecture**: Single Next.js application (App Router) using TypeScript.
-   **Database**:
    -   Primary database: Hosted PostgreSQL via Supabase (online).
    -   Development fallback: Local PostgreSQL instance using the same Prisma schema.
    -   Application code must work unchanged against both; only configuration (e.g., `DATABASE_URL`) differs.
-   **Authentication & Security**:
    -   Email+password authentication with securely hashed passwords (e.g., bcrypt).
    -   Session-based authentication using HTTP-only cookies.
    -   Basic protections against common issues (e.g., input validation, rate limiting for key operations where practical).
-   **Performance**:
    -   Indexed queries for feed and profile views (indexes on post creation time and author).
    -   Pagination or lazy loading for the global feed to avoid loading all posts at once.
-   **Reliability & Integrity**:
    -   Enforce uniqueness constraints at the database level (e.g., email, username, one like per user/post).
    -   Foreign key constraints between users, posts, likes, and replies.
-   **Usability**:
    -   Simple, responsive UI optimized for desktop and mobile.
    -   Clear validation messages for invalid login, registration, or post content.
-   **Testing**:
    -   Automated tests for core flows (registration, login, posting, liking, replying, viewing feeds and profiles).
    -   Tests must be runnable via a single command (e.g., `npm test`) and produce logs.

## Explicit Constraints

-   **No private messaging**: The system must not implement direct or private messages between users.
-   **No retweets/reposts**: The system must not support reposting or sharing others’ posts as a first-class feature.
-   **No follower graph**: There are no follow relationships; the only feed is the global feed of all posts.

## User Flows (High Level)

1. **Sign up**

    - User visits the site, navigates to the registration page.
    - User enters email, username, password, and optional display name.
    - On success, user is created and logged in, then redirected to the global feed.

2. **Login**

    - Existing user navigates to login page.
    - User enters email and password.
    - On success, a session is created, and the user is redirected to the global feed.

3. **Create a post**

    - From the global feed or profile page, authenticated user enters text within the character limit and submits.
    - New post appears at the top of the global feed and the user’s profile posts list.

4. **View global feed**

    - Any visitor (optionally unauthenticated) can view the global feed.
    - Feed shows posts with author info, timestamps, like counts, and reply counts.

5. **Like/unlike a post**

    - Authenticated user clicks a like button on a post.
    - Like count updates, and the user’s like state is reflected.
    - Clicking again removes the like.

6. **Reply to a post**

    - Authenticated user opens a post’s detail view or reply UI.
    - User submits a reply (short text with character limit).
    - Reply appears under the parent post, but replies to replies are not allowed.

7. **View a user profile**
    - User navigates to a profile (e.g., by clicking on a username in the feed).
    - Profile shows user info and their posts in reverse chronological order.

This document guides the implementation of the Next.js microblogging app, ensuring all assignment features and constraints are covered.
