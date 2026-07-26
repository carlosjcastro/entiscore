create table analyses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  url text not null,
  site_name text not null,
  favicon_url text,
  report jsonb not null,
  created_at timestamptz default now() not null
);

create table comparisons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  report_a jsonb not null,
  report_b jsonb not null,
  site_name_a text not null,
  site_name_b text not null,
  favicon_url_a text,
  favicon_url_b text,
  created_at timestamptz default now() not null
);

create index analyses_code_idx on analyses (code);
create index comparisons_code_idx on comparisons (code);

alter table analyses enable row level security;
alter table comparisons enable row level security;

create policy "Lectura pública por código" on analyses
  for select using (true);

create policy "Inserción desde el servidor" on analyses
  for insert with check (true);

create policy "Lectura pública por código" on comparisons
  for select using (true);

create policy "Inserción desde el servidor" on comparisons
  for insert with check (true);
