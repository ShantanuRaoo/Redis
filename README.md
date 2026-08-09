# Redis Playground

A collection of small Express.js projects for learning and simulating core Redis functionality — connections, key-value caching, TTL/expiry, list-based queues, BullMQ job queues, and data modeling with JSON vs Hashes. Each sub-project is a standalone, runnable Express server with its own `package.json`, focused on one Redis concept at a time.

## Why this repo exists

Instead of a single sprawling app, this repo isolates each Redis pattern into its own minimal project so the behavior of a specific command or workflow is easy to trace end-to-end — from an HTTP request, through the Redis call, to the response.

## Projects

### `connecting-redis`
Baseline sanity-check project. Confirms a working connection to both Redis (via `ioredis`) and MongoDB (via `mongoose`), each behind a simple GET route (`/redis`, `/mongo`).

### `email-queue-lists`
A minimal job queue built directly on Redis Lists (`LPUSH` / `RPOP`) — no external queue library. `POST /emails` pushes an email job onto the queue; `GET /emails` pops and "processes" the oldest job. Demonstrates the producer/consumer pattern using only raw Redis list commands.

### `jobs-queue-bullmq`
The same email-job idea, rebuilt on [BullMQ](https://docs.bullmq.io/) instead of raw lists. Split into three files:
- `queue.js` — defines the shared Redis connection and the `emailQueue` Queue instance.
- `api.js` — Express API that enqueues jobs (`POST /welcome-email`) with retry/backoff config.
- `worker.js` — a separate worker process that consumes and processes jobs, with `completed`/`failed` event listeners.

Shows how BullMQ layers retries, exponential backoff, and job lifecycle events on top of Redis.

### `otp-login-ttl`
Simulates an OTP (one-time password) login flow using Redis key expiry (`SET ... EX`). Covers generating and storing an OTP with a TTL, verifying it, deleting it after use, and checking remaining TTL via `TTL`.

### `site-banner`
The simplest example in the repo — a single Redis string key (`app:banner`) used as a toggleable site-wide banner message, with full CRUD (`POST`, `GET`, `DELETE`) plus an `EXISTS` check route.

### `user-profile-cache-json-vs-hash`
Compares two ways of caching structured data in Redis: storing an entire object as a serialized JSON string vs. storing it as a native Redis Hash (`HSET`/`HGETALL`). Same data, two storage strategies, side by side.

## Tech stack

- **Node.js** (ES modules)
- **Express** — HTTP layer for every sub-project
- **ioredis** — Redis client
- **BullMQ** — job queue abstraction (used only in `jobs-queue-bullmq`)
- **Mongoose** — used only in `connecting-redis` as a connection sanity check
- **Docker Compose** — spins up local Redis and MongoDB instances for all projects to share

## Running locally

1. Start the shared infrastructure:
   ```bash
   docker compose up
   ```
   This brings up Redis (`localhost:6379`) and MongoDB (`localhost:27017`).

2. Pick a sub-project and install its dependencies:
   ```bash
   cd <project-folder>
   npm install
   ```

3. Run it:
   ```bash
   npm run dev
   ```
   (For `jobs-queue-bullmq`, run the API and worker as two separate processes — see that project's notes below.)

4. Test routes with Postman, curl, or any HTTP client. Default port for every project is `3000`, so only run one project at a time unless you change the port.

### Note on `jobs-queue-bullmq`

This one needs two terminals running simultaneously:
```bash
node src/api.js      # terminal 1 — accepts jobs over HTTP
node src/worker.js   # terminal 2 — processes jobs from the queue
```

## Status

Learning/reference project — not production-hardened. Error handling, input validation, and auth are intentionally minimal so the Redis-specific logic stays easy to read.
