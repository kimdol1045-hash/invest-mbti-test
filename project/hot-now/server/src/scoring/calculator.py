"""Trend scoring — weighted multi-source score with time decay and surge bonus."""

import math
from datetime import datetime, timedelta, timezone

from src.common import db
from src.common.logger import get_logger

log = get_logger("scoring")

# 소스별 가중치
WEIGHTS: dict[str, float] = {
    "google_trends_rss": 0.45,        # 메인: 국내 실시간 급상승
    "google_trends_rss_global": 0.40, # 메인: 해외 실시간 급상승
    "naver_datalab": 0.20,            # 보조: 한국 검색 비율
    "google_trends_kr": 0.10,         # 보조: pytrends KR
    "google_trends_global": 0.10,     # 보조: pytrends Global
}

KR_SOURCES = {"google_trends_rss", "google_trends_kr", "naver_datalab"}
GLOBAL_SOURCES = {"google_trends_rss_global", "google_trends_global"}


def _format_volume(volume: int) -> str:
    if volume >= 10000:
        return f"{volume / 10000:.1f}만"
    if volume >= 1000:
        return f"{volume / 1000:.1f}천"
    return str(volume)


async def _get_previous_scores() -> dict[str, dict]:
    """Get most recent scores for velocity/change calculation."""
    result = await db.select(
        "trend_scores",
        columns="keyword,score,rank_all",
        order_by="scored_at",
        desc=True,
        limit=500,
    )
    scores: dict[str, dict] = {}
    for row in result.data or []:
        kw = row["keyword"]
        if kw not in scores:
            scores[kw] = {"score": row["score"], "rank": row.get("rank_all")}
    return scores


async def calculate_scores() -> list[dict]:
    """Calculate weighted trend scores.

    Algorithm:
      score = Σ(normalized_score × weight)
      score *= exp(-0.1 × hours_since_peak)  # time decay
      if velocity > 2.0: score *= 1.5         # surge bonus
    """
    since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    raw_rows = await db.get_recent_raw(since)

    if not raw_rows:
        log.info("scoring_skip", reason="no recent raw data")
        return []

    # Aggregate by keyword+source
    agg: dict[str, dict[str, list[float]]] = {}
    keyword_times: dict[str, datetime] = {}

    for row in raw_rows:
        kw = row.get("keyword", "").strip()
        source = row.get("source", "")
        if not kw or not source:
            continue

        if kw not in agg:
            agg[kw] = {}
        if source not in agg[kw]:
            agg[kw][source] = []

        # Use inverse rank as signal (rank 1 → 100, rank 20 → 80, etc.)
        metadata = row.get("metadata", {}) or {}
        rank = metadata.get("rank", 50)
        rank_score = max(0, 100 - (rank - 1) * 5)  # rank 1=100, rank 20=5

        # If raw_score is available (e.g., naver ratio), blend it
        raw_score = row.get("raw_score")
        if raw_score is not None:
            rank_score = (rank_score + float(raw_score)) / 2

        agg[kw][source].append(rank_score)

        collected = row.get("collected_at", "")
        if collected:
            try:
                t = datetime.fromisoformat(collected.replace("Z", "+00:00"))
                if kw not in keyword_times or t > keyword_times[kw]:
                    keyword_times[kw] = t
            except (ValueError, TypeError):
                pass

    # Weighted score calculation
    now = datetime.now(timezone.utc)
    keyword_scores: list[dict] = []

    for kw, sources in agg.items():
        weighted_sum = 0.0
        weight_total = 0.0
        source_count = 0
        source_list = []

        for source, scores in sources.items():
            weight = WEIGHTS.get(source, 0.2)
            avg_score = sum(scores) / len(scores)
            normalized = min(avg_score, 100)  # cap at 100
            weighted_sum += normalized * weight
            weight_total += weight
            source_count += 1
            source_list.append(source)

        base_score = weighted_sum / max(weight_total, 0.01)

        # Time decay: exp(-0.1 * hours_since_peak)
        peak_time = keyword_times.get(kw, now)
        hours_since = (now - peak_time).total_seconds() / 3600
        decay = math.exp(-0.1 * hours_since)
        score = base_score * decay

        # Estimate search volume from score (rough mapping for display)
        search_volume = int(score * 3000)

        keyword_scores.append({
            "keyword": kw,
            "score": round(score, 1),
            "search_volume": search_volume,
            "search_volume_formatted": _format_volume(search_volume),
            "source_count": source_count,
            "sources": source_list,
        })

    # Sort by score descending
    keyword_scores.sort(key=lambda x: x["score"], reverse=True)

    # Get previous scores for change detection
    prev_scores = await _get_previous_scores()

    # Assign ranks and detect changes
    kr_items = [k for k in keyword_scores if any(s in KR_SOURCES for s in k["sources"])]
    global_items = [k for k in keyword_scores if any(s in GLOBAL_SOURCES for s in k["sources"])]

    kr_rank_map = {k["keyword"]: i + 1 for i, k in enumerate(kr_items)}
    global_rank_map = {k["keyword"]: i + 1 for i, k in enumerate(global_items)}

    now_iso = now.isoformat()
    results = []

    for rank_all, ks in enumerate(keyword_scores, 1):
        prev = prev_scores.get(ks["keyword"])
        prev_score = prev["score"] if prev else None
        velocity = round(ks["score"] - prev_score, 1) if prev_score is not None else 0.0

        # Surge bonus
        score = ks["score"]
        if velocity > 2.0:
            score = round(score * 1.5, 1)
            score = min(score, 100.0)

        # Change type
        if prev is None:
            change_type = "new"
            change_amount = 0
        elif abs(velocity) < 1.0:
            change_type = "same"
            change_amount = 0
        elif velocity > 0:
            change_type = "up"
            prev_rank = prev.get("rank", rank_all)
            change_amount = max(0, prev_rank - rank_all)
        else:
            change_type = "down"
            prev_rank = prev.get("rank", rank_all)
            change_amount = max(0, rank_all - prev_rank)

        row = {
            "keyword": ks["keyword"],
            "score": score,
            "velocity": velocity,
            "rank_all": rank_all,
            "rank_kr": kr_rank_map.get(ks["keyword"]),
            "rank_global": global_rank_map.get(ks["keyword"]),
            "change_type": change_type,
            "change_amount": change_amount,
            "source_count": ks["source_count"],
            "sources": ks["sources"],
            "search_volume": ks["search_volume"],
            "search_volume_formatted": ks["search_volume_formatted"],
            "region": "all",
            "scored_at": now_iso,
        }
        results.append(row)

    if results:
        await db.bulk_upsert("trend_scores", results, on_conflict="keyword,scored_at")
        log.info("scores_calculated", count=len(results), top=results[0]["keyword"])

    return results
