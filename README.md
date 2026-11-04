# HapiVet

MERN monorepo for the HapiVet website, admin panel and API. A mobile app can join later as `apps/mobile`.

| Package | Stack |
| --- | --- |
| `apps/web` | React, Vite, Framer Motion, Three.js (react-three-fiber), Lenis |
| `apps/api` | Express, MongoDB, Mongoose. See `apps/api/README.md` |

## Run it

```bash
npm run setup
npm run dev
```

`setup` installs both apps, and only needs running once. `dev` starts the API with a local MongoDB, then the website. The first run downloads MongoDB.

The site runs at http://localhost:5180 and the admin panel at http://localhost:5180/admin.

Other commands: `npm test` for the API tests, `npm run build`, then `npm run preview` to serve the production build.

## Logins

- **Customers:** any mobile number, and the code is `123456`. No SMS is sent yet, and the login page shows the code.
- **Admin:** at `/admin`, also linked from the footer. Locally the email and password are the defaults in `apps/api/.env.example`. In production you set your own, and the API won't start without them.

## Customer sign-in

**Sign In** on the website opens `/login`. Signing in replaces the button with a profile avatar that opens `/profile`. Only the name can be edited there. Mobile and email are read-only, and the email is sample data because sign-in only asks for the number.

## Book a Demo

`/demo` follows hapivet.com/demo, which embeds a Cal.com event, in this site's colours. The times are read live from that event through Cal.com's public API (`apps/web/src/lib/slots.js`), so they match the live site in any time zone. If Cal.com can't be reached, the page falls back to the weekly pattern saved in that file.

A booking made here becomes a lead in the admin panel. It does not create a booking on Cal.com, so the time stays open on hapivet.com. Times booked here are only taken off this site's calendar.

## Lead workflow

In **Admin > Leads**, click a row to open the drawer. Each lead moves one step at a time: New, Accepted, Contacted, Demo booked, then Won or Lost. Lost can happen at any step, and closed leads can be reopened.

Customers follow the same steps under **My Demo Bookings** (`/my-bookings`). A booking appears on the account that made it, or on the account whose number was given on the form. Updates reach open pages straight away, on any device, through a server-sent event stream.

## Where data lives

Everything is in MongoDB, behind the API. `apps/web/src/lib/store.js` is the only file in the website that talks to it. Website content from `apps/web/src/data/seed.js` fills the page until the API answers, and the last answer is kept in the browser, so pages never wait on the API to show something.

## Deploy

Do these in order. You need GitHub, MongoDB Atlas, Render and Vercel accounts.

### 1. Database on MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, add a database user.
3. Under **Network Access**, allow `0.0.0.0/0`, because Render's addresses change.
4. Copy the connection string, fill in the password, and add the database name before the `?`: `mongodb+srv://user:password@cluster.mongodb.net/hapivet?retryWrites=true&w=majority`.

### 2. API on Render

1. On [Render](https://render.com), create a **Web Service** from the GitHub repo.
2. Set **Root Directory** to `apps/api`, build command to `npm install`, start command to `npm start`.
3. Set **Health Check Path** to `/api/health`.
4. Add the environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | The connection string from Atlas |
| `JWT_SECRET` | A long random string, at least 32 characters |
| `ADMIN_EMAIL` | The email you'll sign in to the admin panel with |
| `ADMIN_PASSWORD` | Your own password, at least 8 characters |
| `CORS_ORIGIN` | Your Vercel address. Use a placeholder until step 3 gives you the real one |

5. Deploy, then open `https://<your-service>.onrender.com/api/health`. It should show `{"ok":true}`. The first start fills the database with the website content.

### 3. Website on Vercel

1. Import the GitHub repo in Vercel and set **Root Directory** to `apps/web`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add the environment variable `VITE_API_URL` set to your Render address. It's read at build time, so add it before deploying, and redeploy if it changes.
4. Deploy.

`apps/web/vercel.json` sends every path to the app, so refreshing `/demo` or `/admin` works.

### 4. Connect them

On Render, set `CORS_ORIGIN` to your Vercel address, for example `https://hapivet.vercel.app`. Separate several addresses with commas. Render restarts the API by itself. Then book a demo on the live site and check it appears in the admin panel.

### On Render's free plan

The API sleeps after about 15 minutes without requests, and the next request takes about a minute to wake it. Pages still show straight away, but the first sign-in or booking after a quiet spell can take that long. A paid instance doesn't sleep.

## Content sources

- Copy, pricing, team and integrations: hapivet.com
- Team photos and logo: hot-linked from hapivet.com
- All other images: Unsplash
- Achievements: hapivet.com/press and public LinkedIn posts (see `achievements` in `apps/api/src/data/seed.js`)
- Leads in the admin panel: invented sample data
- Demo event details and booking form fields: the HapiVet event on Cal.com
