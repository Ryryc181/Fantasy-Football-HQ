# Fantasy Fools HQ v4 — Deployment Checklist

## 1. GitHub
1. Unzip the v4 PATCH package on your computer.
2. Open GitHub > Ryryc181/Fantasy-fools-hq-live.
3. Add file > Upload files.
4. Drag the CONTENTS of the patch folder into the repository. Keep the folder paths exactly as supplied.
5. Commit directly to `main` with: `Fantasy Fools HQ v4 front office`.
6. Vercel will automatically start a deployment.

## 2. Supabase — one required cleanup
Yahoo's signed API agreement says Yahoo Fantasy Information must not be stored, cached, or indexed. v4 therefore no longer saves Yahoo rosters/free agents/snapshots in Supabase.

1. Open Supabase > Fantasy Fools project > SQL Editor.
2. Open `supabase/yahoo-compliance-migration.sql` from this package.
3. Paste it into a new query.
4. Click Run.
5. This removes only the old Yahoo-data tables. It keeps `oauth_tokens` and `news_items`.

Do NOT delete `oauth_tokens` or `news_items`.

## 3. Vercel
Open Vercel > fantasy-fools-hq-live > Settings > Environment Variables.

Keep these existing values:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- YAHOO_CLIENT_ID
- YAHOO_CLIENT_SECRET
- YAHOO_REDIRECT_URI = https://fantasy-fools-hq-live-psi.vercel.app/api/auth/yahoo/callback
- NEXT_PUBLIC_SITE_URL = https://fantasy-fools-hq-live-psi.vercel.app
- NIXFLIX_TEAM_NAME = Nixflix and Chill
- CRON_SECRET

After Yahoo finishes provisioning Fantasy Sports access:
1. Redeploy the latest Vercel deployment once.
2. Open the HQ and click Connect Yahoo.
3. Open `/api/yahoo/leagues` in the browser.
4. Find the 2026 Fantasy Fools league key.
5. Add/update Vercel variable `YAHOO_LEAGUE_KEY` with that exact league key.
6. Redeploy once more.
7. Open the HQ. Live rosters, FAs, needs, values and trade tools should populate.

## 4. Important behavior change
There is no longer a Download Yahoo Snapshot button and no historical Yahoo snapshot warehouse. Live Yahoo information is retrieved when the HQ page loads. This is intentional.

## 5. Test checklist
- Header says Live Yahoo session
- Teams Connected = 10
- Nixflix Players is populated
- Team Needs shows all 10 teams
- War Room search finds matching players
- War Room identifies a drop and explains both sides
- Trade Evaluator accepts multiple players on each side
- Player Values can filter/search
- Free Agents shows team-specific War Room scores
- Footer contains Fantasy data provided by Yahoo Fantasy
