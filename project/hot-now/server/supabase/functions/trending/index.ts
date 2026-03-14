/**
 * GET /trending — TOP 20 트렌드 키워드 조회
 *
 * Query params:
 *   region: 'all' | 'kr' | 'global' (required)
 *   category: '전체' | '기술' | '경제' | '스포츠' | '엔터' | '정치' | '생활' (optional)
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
    const region = url.searchParams.get("region") || "all";
    const category = url.searchParams.get("category") || "전체";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    // Get latest scored_at timestamp
    const { data: latest } = await supabase
      .from("trend_scores")
      .select("scored_at")
      .order("scored_at", { ascending: false })
      .limit(1)
      .single();

    if (!latest) {
      return new Response(
        JSON.stringify({ keywords: [], updatedAt: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build query for latest scores
    let query = supabase
      .from("trend_scores")
      .select("*")
      .eq("scored_at", latest.scored_at);

    // Region filter
    if (region === "kr") {
      query = query.not("rank_kr", "is", null).order("rank_kr");
    } else if (region === "global") {
      query = query.not("rank_global", "is", null).order("rank_global");
    } else {
      query = query.order("rank_all");
    }

    query = query.limit(20);

    const { data: scores, error } = await query;
    if (error) throw error;

    // Get categories from normalized_keywords
    const keywords = (scores || []).map((s: Record<string, unknown>) => s.keyword);
    const { data: nkData } = await supabase
      .from("normalized_keywords")
      .select("keyword,category,is_sensitive,sensitivity_level")
      .in("keyword", keywords);

    const nkMap = new Map(
      (nkData || []).map((n: Record<string, unknown>) => [n.keyword, n]),
    );

    // Filter and format response
    let result = (scores || [])
      .map((s: Record<string, unknown>, idx: number) => {
        const nk = nkMap.get(s.keyword as string) as Record<string, unknown> | undefined;
        const cat = (nk?.category as string) || "생활";
        const isSensitive = nk?.is_sensitive as boolean | undefined;
        const sensitivityLevel = nk?.sensitivity_level as string | undefined;

        // Filter out blocked keywords
        if (isSensitive && sensitivityLevel === "L1_BLOCK") return null;

        let rank: number;
        if (region === "kr") {
          rank = s.rank_kr as number;
        } else if (region === "global") {
          rank = s.rank_global as number;
        } else {
          rank = s.rank_all as number;
        }

        return {
          id: s.id,
          rank: rank || idx + 1,
          keyword: s.keyword,
          category: cat,
          searchVolume: s.search_volume || 0,
          searchVolumeFormatted: s.search_volume_formatted || "0",
          changeType: s.change_type || "new",
          changeAmount: s.change_amount || 0,
          score: s.score,
          region,
        };
      })
      .filter(Boolean);

    // Apply category filter
    if (category !== "전체") {
      result = result.filter(
        (k: Record<string, unknown>) => k.category === category,
      );
    }

    // Re-rank after filtering
    result = result.map((k: Record<string, unknown>, i: number) => ({
      ...k,
      rank: i + 1,
    }));

    return new Response(
      JSON.stringify({
        keywords: result,
        updatedAt: latest.scored_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
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
