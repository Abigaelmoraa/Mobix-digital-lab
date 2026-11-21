# MØBIX Digital Lab

A digital studio website and studio dashboard built with React 19, Tailwind CSS 4, Node.js, Express, and MySQL.

## Development

Requirements: Node.js 20+, npm, and a local MySQL server such as XAMPP running on port 3306.

Copy `server/.env.example` to `server/.env` and set `JWT_SECRET` to a long random value and
`OWNER_EMAIL` to the account allowed to claim studio access. The root `.env` is optional; without it
the site uses `http://localhost:3001/api`.

```sh
npm install --legacy-peer-deps
npm run db:init
npm run dev:full
```

The website runs at http://localhost:8080 and the API runs at http://localhost:3001/api.

## Studio access

Register with the owner email configured in `server/.env`, then open `/studio` and choose **Set up studio access**.
