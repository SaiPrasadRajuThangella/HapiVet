# HapiVet

MERN monorepo for the HapiVet website, admin panel and API. A mobile app can join later as `apps/mobile`.

| Package | Status | Stack |
| --- | --- | --- |
| `apps/web` | Built, running on mock data | React, Vite, Framer Motion, Three.js (react-three-fiber), Lenis |
| `apps/api` | Not built yet, see `apps/api/README.md` | Express, MongoDB, Mongoose |

## Run it

```bash
npm install
npm run dev
```

The site runs at http://localhost:5180 and the admin panel at http://localhost:5180/admin.

Other commands: `npm run build`, then `npm run preview` to serve the production build.

## Customer sign-in

**Sign In** on the website opens `/login`. Any mobile number works and the code is always `123456`; no SMS is sent. Signing in replaces the button with a profile avatar that opens `/profile`. Only the name can be edited there. Mobile and email are read-only, and the email is sample data until the API exists.

## Book a Demo

`/demo` follows hapivet.com/demo, which embeds a Cal.com event. The times are read live from that event through Cal.com's public API (`apps/web/src/lib/slots.js`), so they match the live site in any time zone. If Cal.com can't be reached, the page falls back to the weekly pattern saved in that file.

A booking made here becomes a lead in the admin panel. It does not create a booking on Cal.com, so the time stays open on hapivet.com. Times booked here are only taken off this site's calendar.

## Lead workflow

In **Admin > Leads**, click a row to open the drawer. Each lead moves one step at a time: New, Accepted, Contacted, Demo booked, then Won or Lost. Lost can happen at any step, and closed leads can be reopened.

Customers follow the same steps under **My Demo Bookings** (`/my-bookings`). A booking appears on the account that made it, or on the account whose number was given on the form. Updates arrive without a refresh, but only between tabs of the same browser while data lives in localStorage. Real-time updates across devices need the API.

## Mock admin login

The admin panel is at `/admin`, also linked from the footer. For local development only:

- Email: `admin@hapivet.com`
- Password: `   `

The check runs in the browser (`apps/web/src/lib/store.js`), so it is not real security. Replace it with API auth before deploying.

## Mock data

`apps/web/src/lib/store.js` is the only file that knows where data lives. It seeds from `apps/web/src/data/seed.js` and saves changes to the browser's localStorage, so admin edits show up on the site straight away, in that browser only. When the API exists, swap the bodies of `db` and `auth` for `fetch()` calls.

## Deploy

### Website on Vercel

1. Import the GitHub repo in Vercel and set **Root Directory** to `apps/web`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Deploy. No environment variables are needed until the API exists.

`apps/web/vercel.json` sends every path to the app, so refreshing `/demo` or `/admin` works.

Until the API exists, all data stays in each visitor's own browser. A booking made on one device never reaches the admin panel on another, so treat a deployment as a preview. The mock admin login also ships in the site's JavaScript, so it protects nothing.

### API on Render with MongoDB Atlas

The API isn't built yet. `apps/api/README.md` has the steps for when it is.

## Content sources

- Copy, pricing, team and integrations: hapivet.com
- Team photos and logo: hot-linked from hapivet.com
- All other images: Unsplash
- Achievements: hapivet.com/press and public LinkedIn posts (see `achievements` in `seed.js`)
- Leads in the admin panel: invented sample data
- Demo event details and booking form fields: the HapiVet event on Cal.com
