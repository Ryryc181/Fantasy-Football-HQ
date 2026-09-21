# Fantasy Fools HQ 2026 — Front Office v4

Private personal-use Fantasy Fools dashboard for Nixflix and Chill.

## Front-office tools
- Team Needs: QB/RB/WR/TE urgency for all 10 teams
- War Room: search a player, choose a fantasy team, receive acquisition score, fit explanation, and recommended drop
- Player Values: Fantasy Fools-specific HQ and trade values
- Trade Evaluator: multi-player Team A / Team B evaluator with fairness and roster-impact scores
- Trade Finder: targets, partners, offer concepts, and explanations
- Free-Agent Fit Board: grades each FA separately for each fantasy team
- Nixflix lineup optimizer and league power snapshot
- NFL news layer

## Yahoo compliance architecture
Yahoo Fantasy Information is fetched live into server/browser memory and is not written to Supabase. The prior current_state, league_snapshots, rosters, free_agents and recommendations tables should be removed with `supabase/yahoo-compliance-migration.sql`.

Supabase stores only Yahoo OAuth credentials and the separate non-Yahoo NFL news feed.

## Required Vercel variables
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
YAHOO_CLIENT_ID
YAHOO_CLIENT_SECRET
YAHOO_REDIRECT_URI
NEXT_PUBLIC_SITE_URL
YAHOO_LEAGUE_KEY
NIXFLIX_TEAM_NAME
CRON_SECRET

See `docs/V4_DEPLOYMENT.md`.
