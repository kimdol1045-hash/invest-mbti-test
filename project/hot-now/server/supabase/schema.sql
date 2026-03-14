-- 핫나우 백엔드 DB 스키마
-- Supabase (PostgreSQL) 용

-- 1. raw_trends: 소스별 원본 데이터
create table if not exists raw_trends (
  id bigint generated always as identity primary key,
  source text not null,           -- 'google_trends_kr' | 'google_trends_global' | 'naver_datalab'
  keyword text not null,
  raw_score real,                 -- 소스 제공 점수 (nullable)
  region text not null default 'kr',
  collected_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_raw_trends_keyword on raw_trends (keyword);
create index if not exists idx_raw_trends_source on raw_trends (source, collected_at desc);
create index if not exists idx_raw_trends_collected on raw_trends (collected_at desc);

-- 2. normalized_keywords: 정규화된 키워드 + 카테고리
create table if not exists normalized_keywords (
  id uuid default gen_random_uuid() primary key,
  keyword text unique not null,
  normalized_en text default '',
  aliases jsonb default '[]'::jsonb,
  category text default '생활',   -- '기술' | '경제' | '스포츠' | '엔터' | '정치' | '생활'
  is_sensitive boolean,
  sensitivity_level text,         -- 'SAFE' | 'L1_BLOCK' | 'L2_REVIEW' | 'L3_ELECTION'
  sensitivity_reason text,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_nk_category on normalized_keywords (category);

-- 3. trend_scores: 통합 점수 (메인 API 응답용)
create table if not exists trend_scores (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  score real not null default 0,
  velocity real default 0,        -- 점수 변화율
  rank_all int,
  rank_kr int,
  rank_global int,
  change_type text default 'new', -- 'up' | 'down' | 'new' | 'same'
  change_amount int default 0,
  source_count int default 0,
  sources jsonb default '[]'::jsonb,
  search_volume bigint default 0,
  search_volume_formatted text default '',
  region text default 'all',
  scored_at timestamptz not null default now()
);

create unique index if not exists idx_ts_keyword_scored on trend_scores (keyword, scored_at);
create index if not exists idx_ts_score on trend_scores (score desc);
create index if not exists idx_ts_scored_at on trend_scores (scored_at desc);

-- 4. keyword_summaries: AI 요약 캐시
create table if not exists keyword_summaries (
  id uuid default gen_random_uuid() primary key,
  keyword text unique not null,
  summary text default '',          -- 2~3문장 AI 요약
  key_point text default '',        -- 핵심 한 줄
  related_keywords jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 5. keyword_history: 시간별 점수 기록 (24시간 차트용)
create table if not exists keyword_history (
  id bigint generated always as identity primary key,
  keyword text not null,
  score real not null default 0,
  velocity real default 0,
  rank_all int,
  rank_kr int,
  rank_global int,
  source_count int default 0,
  change_type text default 'stable',
  snapshot_at timestamptz not null default now()
);

create index if not exists idx_kh_keyword_time on keyword_history (keyword, snapshot_at desc);
create index if not exists idx_kh_snapshot on keyword_history (snapshot_at desc);

-- RLS 정책 (Edge Functions에서 anon key로 읽기 허용)
alter table trend_scores enable row level security;
alter table keyword_summaries enable row level security;
alter table keyword_history enable row level security;
alter table normalized_keywords enable row level security;

create policy "Allow public read on trend_scores"
  on trend_scores for select using (true);

create policy "Allow public read on keyword_summaries"
  on keyword_summaries for select using (true);

create policy "Allow public read on keyword_history"
  on keyword_history for select using (true);

create policy "Allow public read on normalized_keywords"
  on normalized_keywords for select using (true);

-- 오래된 데이터 정리용 함수 (선택)
create or replace function cleanup_old_data() returns void as $$
begin
  -- raw_trends: 7일 이전 데이터 삭제
  delete from raw_trends where collected_at < now() - interval '7 days';
  -- keyword_history: 48시간 이전 데이터 삭제
  delete from keyword_history where snapshot_at < now() - interval '48 hours';
  -- trend_scores: 최신 scored_at만 유지 (keyword별 최근 1건 외 삭제)
  delete from trend_scores
  where id not in (
    select distinct on (keyword) id
    from trend_scores
    order by keyword, scored_at desc
  );
end;
$$ language plpgsql;
