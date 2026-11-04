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

## Mock admin login

For local development only:

- Email: `admin@hapivet.com`
- Password: `   `

The check runs in the browser (`apps/web/src/lib/store.js`), so it is not real security. Replace it with API auth before deploying.

## Mock data

`apps/web/src/lib/store.js` is the only file that knows where data lives. It seeds from `apps/web/src/data/seed.js` and saves changes to the browser's localStorage, so admin edits show up on the site straight away, in that browser only. When the API exists, swap the bodies of `db` and `auth` for `fetch()` calls.

## Content sources

- Copy, pricing, team and integrations: hapivet.com
- Team photos and logo: hot-linked from hapivet.com
- All other images: Unsplash
- Achievements: hapivet.com/press and public LinkedIn posts (see `achievements` in `seed.js`)
- Leads in the admin panel: invented sample data
