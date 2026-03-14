-- 서버(anon key)에서 쓰기 허용
-- 프로덕션에서는 service_role 키로 교체 권장

-- raw_trends
alter table raw_trends enable row level security;
create policy "Allow insert on raw_trends" on raw_trends for insert with check (true);
create policy "Allow select on raw_trends" on raw_trends for select using (true);

-- normalized_keywords
create policy "Allow insert on normalized_keywords" on normalized_keywords for insert with check (true);
create policy "Allow update on normalized_keywords" on normalized_keywords for update using (true);

-- trend_scores
create policy "Allow insert on trend_scores" on trend_scores for insert with check (true);
create policy "Allow update on trend_scores" on trend_scores for update using (true);

-- keyword_summaries
create policy "Allow insert on keyword_summaries" on keyword_summaries for insert with check (true);
create policy "Allow update on keyword_summaries" on keyword_summaries for update using (true);

-- keyword_history
create policy "Allow insert on keyword_history" on keyword_history for insert with check (true);
