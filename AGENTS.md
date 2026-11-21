## Application Architecture

- The React frontend reads published services and courses through TanStack server functions that call the Node API; enquiries, authentication, and studio changes call the Node API directly.
- Authentication uses a JWT stored in browser local storage. The API signs the token and middleware protects every studio endpoint.
- Only the configured owner email can claim the first administrator role, and the claim is atomic so it cannot be repeated.
- MySQL schema and seed data live in `server/src/schema.sql` and `server/src/init-db.js`. Rebuild the local database with `npm run db:init`.
- Keep Secrets and `.env` files out of version control.
