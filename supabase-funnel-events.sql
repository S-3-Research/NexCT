-- Event-driven funnel tracking for landing page + apply page
-- Append-only, permanent retention (per product decision, low QPS ~50/day)

create table public.funnel_events (
  id uuid not null default gen_random_uuid(),
  project text not null default 'nexct-nursematch',
  session_id text not null,
  event_type text not null,      -- 'page_view' | 'step_view' | 'step_complete' | 'form_submit'
  page text not null,            -- 'landing' | 'apply'
  step integer null,             -- 1-5, apply 表单步骤（landing page_view 为 null）
  path text null,
  referrer text null,
  ip inet null,
  geo_city text null,
  geo_region text null,
  geo_country text null,
  geo_lat double precision null,
  geo_lng double precision null,
  user_agent text null,
  device_type text null,         -- 'mobile' | 'tablet' | 'desktop'
  browser text null,
  os text null,
  metadata jsonb null,
  is_test boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint funnel_events_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_project on public.funnel_events using btree (project) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_session on public.funnel_events using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_created_at on public.funnel_events using brin (created_at) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_type_page on public.funnel_events using btree (event_type, page) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_is_test on public.funnel_events using btree (is_test) TABLESPACE pg_default;

create index IF not exists idx_funnel_events_geo on public.funnel_events using btree (geo_lat, geo_lng) TABLESPACE pg_default
where
  (
    (geo_lat is not null)
    and (geo_lng is not null)
  );

-- 若表已存在（已执行过旧版本迁移），可单独执行以下语句补充字段：
-- alter table public.funnel_events add column if not exists is_test boolean not null default false;
-- create index IF not exists idx_funnel_events_is_test on public.funnel_events using btree (is_test);

