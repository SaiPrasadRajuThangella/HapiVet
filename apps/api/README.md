# HapiVet API (planned)

Express + MongoDB (Mongoose). Not built yet: the web app runs on mock data until this exists.

## Collections

These match the shapes in `apps/web/src/data/seed.js`:

- `leads`, `achievements`, `testimonials`, `plans`, `team`
- `settings` (a single document)
- `users` (admin accounts with hashed passwords)

## Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public, returns a JWT |
| GET | `/api/achievements`, `/api/testimonials`, `/api/plans`, `/api/team`, `/api/settings` | Public |
| POST | `/api/leads` | Public, rate limited |
| GET | `/api/leads` | Admin |
| POST, PATCH, DELETE | `/api/<collection>/:id` | Admin |
| PATCH | `/api/settings` | Admin |
