-- Fantasy Fools HQ minimal server-owned database.
-- IMPORTANT: do not persist Yahoo Fantasy Information here.
create table if not exists oauth_tokens(provider text primary key,token_json jsonb not null,updated_at timestamptz default now());
create table if not exists news_items(external_id text primary key,source text,author text,title text not null,description text,url text not null,published_at timestamptz,players jsonb not null default '[]'::jsonb,impact_score integer default 0,tags jsonb not null default '[]'::jsonb,raw jsonb,created_at timestamptz default now());
create index if not exists news_items_published_idx on news_items(published_at desc);
alter table oauth_tokens enable row level security;alter table news_items enable row level security;
