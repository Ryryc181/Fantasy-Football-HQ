-- Fantasy Fools HQ Yahoo API compliance migration
-- Yahoo Fantasy data is fetched live and must not be stored, cached, or indexed.
-- OAuth credentials remain in oauth_tokens; non-Yahoo news may remain in news_items.
drop table if exists recommendations cascade;
drop table if exists free_agents cascade;
drop table if exists rosters cascade;
drop table if exists league_snapshots cascade;
drop table if exists current_state cascade;
