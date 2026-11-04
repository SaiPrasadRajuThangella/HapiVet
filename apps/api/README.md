# HapiVet API (planned)

Express + MongoDB (Mongoose). Not built yet: the web app runs on mock data until this exists.

## Collections

These match the shapes in `apps/web/src/data/seed.js`:

- `leads`, `achievements`, `testimonials`, `plans`, `team`
- `settings` (a single document)
- `users` (admin accounts with hashed passwords, plus customers signing in by mobile number)

## Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public, returns a JWT |
| GET | `/api/achievements`, `/api/testimonials`, `/api/plans`, `/api/team`, `/api/settings` | Public |
| POST | `/api/auth/otp/request`, `/api/auth/otp/verify` | Public, rate limited; replaces the mock `123456` code |
| PATCH | `/api/me` | Customer, name only |
| GET | `/api/me/bookings` | Customer, their own demo bookings |
| POST | `/api/leads` | Public, rate limited; also books the slot on Cal.com |
| GET | `/api/leads` | Admin |
| POST, PATCH, DELETE | `/api/<collection>/:id` | Admin |
| PATCH | `/api/settings` | Admin |

## Deploying to Render with MongoDB Atlas

For when the API is built:

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), add a database user, allow network access from `0.0.0.0/0`, and copy the connection string.
2. On [Render](https://render.com), create a **Web Service** from the GitHub repo with **Root Directory** `apps/api`, build command `npm install`, start command `npm start`.
3. Add the environment variables: `NODE_ENV=production`, `MONGODB_URI`, a long random `JWT_SECRET`, your own `ADMIN_PASSWORD`, and `CORS_ORIGIN` set to the website's address.
4. In Vercel, set `VITE_API_URL` to the Render address and redeploy the website.
