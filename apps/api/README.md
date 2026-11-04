# HapiVet API

Express + MongoDB (Mongoose). Serves the website and admin panel in `apps/web`.

## Run it

From the repo root, `npm run setup` once, then `npm run dev`. Without `MONGODB_URI` the API starts a local MongoDB, kept in `apps/api/.data` so data survives restarts. The first run downloads MongoDB once.

Tests: `npm test`. They use their own temporary database.

Environment variables are listed in `.env.example`.

## Collections

- `leads`: demo bookings and contact requests, with their status and history
- `achievements`, `testimonials`, `plans`, `team`, and `settings` (a single document)
- `users` (customers, by mobile number) and `admins`

A new database starts with the website content from `src/data/seed.js`. Outside production it also gets sample leads.

## Endpoints

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | For the host's health check |
| POST | `/api/auth/otp` | Public, rate limited | `{ phone }`. No SMS provider yet, so it returns the fixed code as `demoCode` |
| POST | `/api/auth/verify` | Public, rate limited | `{ phone, code, claim? }`. Creates the account on first sign-in. `claim` moves a guest booking onto it |
| POST | `/api/auth/admin` | Public, rate limited | `{ email, password }` |
| GET | `/api/me` | Customer | |
| PATCH | `/api/me` | Customer | `{ name }`. Anything else is refused |
| GET | `/api/me/bookings` | Customer | Their own demo bookings |
| GET | `/api/leads/taken` | Public | Booked times only, for the calendar |
| POST | `/api/leads` | Public, rate limited | A demo booking or contact request. Guests also get a `claimToken` |
| GET | `/api/leads` | Admin | |
| PATCH | `/api/leads/:id` | Admin | `{ status?, note?, slot?, meetingLink?, lostReason? }`. Status moves one stage at a time |
| DELETE | `/api/leads/:id` | Admin | |
| GET | `/api/events` | Customer or admin | Server-sent events: a `change` event when leads change, so open pages fetch again |
| GET | `/api/achievements`, `/api/testimonials`, `/api/plans`, `/api/team`, `/api/settings` | Public | Visitors only get what's published |
| POST, PATCH, DELETE | `/api/<collection>`, `/api/<collection>/:id` | Admin | |
| PATCH | `/api/settings` | Admin | |
| POST | `/api/admin/reset` | Admin | Back to the sample data. Refused in production |

Two bookings can't take the same time: a unique index on `slotLock` makes the second one fail with a 409, and a lost lead lets its time go.

## Before real customers use it

- **Sign-in codes.** Every number uses `FIXED_OTP`, and the login page shows it, so anyone can sign in as any number and see that number's bookings. Connect an SMS provider in `src/routes/auth.js` first.
- **More than one server.** Live updates (`src/lib/events.js`) run inside one process. Running several instances would need Redis or similar.

## Deploying

The repo's main README has the full order of steps. On Render, use **Root Directory** `apps/api`, build command `npm install`, start command `npm start`.
