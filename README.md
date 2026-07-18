# Fantasy Fools Draft Headquarters

A mobile-friendly Next.js survey and commissioner dashboard for choosing the 2026 Fantasy Fools draft date.

## Included

- Required name field
- Required response for all 11 draft-time options
- Minimum of two workable options
- Works Great / I Can Make It Work / Can't Make It ratings
- Required in-person or remote question using Ryan's original wording
- Optional comments and smack talk
- League photos and inside jokes
- Password-protected commissioner dashboard
- Automatic date rankings
- CSV export
- Same-name submissions update the existing response

## 1. Create the database in Supabase

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Paste the contents of `supabase-schema.sql` and run it.
4. Open **Project Settings > API** and copy:
   - Project URL
   - `service_role` secret key — keep this private.

## 2. Add environment variables in Vercel

Add these three variables to the Vercel project:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COMMISSIONER_PASSWORD`

Use a private password only Ryan knows for `COMMISSIONER_PASSWORD`.

## 3. Run locally (optional)

Copy `.env.example` to `.env.local`, fill in the values, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Deploy

Upload this project to GitHub, import the repository into Vercel, add the three environment variables, and deploy.

The survey is at `/` and the commissioner dashboard is at `/commissioner`.
