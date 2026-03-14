/**
 * GET /trending-detail?id=<uuid> — 키워드 상세 조회
 *
 * Returns: KeywordDetail (AI 요약 + 소스별 점수 + 24시간 히스토리)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "id parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    // 1. Get trend_scores row
    const { data: scoreData, error: scoreErr } = await supabase
      .from("trend_scores")
      .select("*")
      .eq("id", id)
      .single();

    if (scoreErr || !scoreData) {
      return new Response(
        JSON.stringify({ error: "Keyword not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const keyword = scoreData.keyword as string;

    // 2. Get AI summary + related keywords
    const { data: summaryData } = await supabase
      .from("keyword_summaries")
      .select("summary,related_keywords")
      .eq("keyword", keyword)
      .single();

    // 3. Get category from normalized_keywords
    const { data: nkData } = await supabase
      .from("normalized_keywords")
      .select("category")
      .eq("keyword", keyword)
      .single();

    // 4. Get 24h history
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: historyData } = await supabase
      .from("keyword_history")
      .select("score,snapshot_at")
      .eq("keyword", keyword)
      .gte("snapshot_at", since)
      .order("snapshot_at", { ascending: true });

    // 5. Build source scores from sources array
    const sources = (scoreData.sources as string[]) || [];
    const sourceWeights: Record<string, string> = {
      naver_datalab: "Naver DataLab",
      google_trends_kr: "Google Trends KR",
      google_trends_global: "Google Trends Global",
    };

    // Get per-source scores from recent raw_trends
    const { data: rawData } = await supabase
      .from("raw_trends")
      .select("source,raw_score,metadata")
      .eq("keyword", keyword)
      .gte("collected_at", since)
      .order("collected_at", { ascending: false })
      .limit(50);

    const sourceScoreMap = new Map<string, number[]>();
    for (const row of rawData || []) {
      const src = row.source as string;
      if (!sourceScoreMap.has(src)) sourceScoreMap.set(src, []);
      const metadata = row.metadata as Record<string, unknown> | null;
      const rank = (metadata?.rank as number) || 50;
      const score = Math.max(0, 100 - (rank - 1) * 5);
      sourceScoreMap.get(src)!.push(score);
    }

    const sourceScores = sources.map((src: string) => {
      const scores = sourceScoreMap.get(src) || [];
      const avg = scores.length > 0
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : 0;
      return {
        source: sourceWeights[src] || src,
        score: avg,
      };
    });

    // 6. Format history for chart
    const history = (historyData || []).map((h: Record<string, unknown>) => {
      const t = new Date(h.snapshot_at as string);
      return {
        time: `${t.getUTCHours().toString().padStart(2, "0")}:00`,
        value: Math.round(h.score as number),
      };
    });

    const detail = {
      id: scoreData.id,
      keyword,
      rank: scoreData.rank_all,
      category: nkData?.category || "생활",
      score: scoreData.score,
      searchVolumeFormatted: scoreData.search_volume_formatted || "0",
      changeType: scoreData.change_type || "new",
      aiSummary: summaryData?.summary || `"${keyword}"에 대한 관심이 급증하고 있어요.`,
      relatedKeywords: summaryData?.related_keywords || [],
      sourceScores,
      history,
    };

    return new Response(JSON.stringify(detail), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
