"""Rank change detector — snapshot history for 24h chart."""

from datetime import datetime, timezone

from src.common import db
from src.common.logger import get_logger

log = get_logger("history")


async def snapshot_history(top_n: int = 50) -> int:
    """Snapshot current top trend_scores into keyword_history.

    Returns number of rows inserted.
    """
    result = await db.select(
        "trend_scores",
        columns="keyword,score,velocity,rank_all,rank_kr,rank_global,source_count,change_type",
        order_by="score",
        desc=True,
        limit=top_n,
    )

    rows = result.data or []
    if not rows:
        log.info("history_skip", reason="no trend_scores data")
        return 0

    now = datetime.now(timezone.utc).isoformat()
    history_rows = [
        {
            "keyword": row["keyword"],
            "score": row["score"],
            "velocity": row.get("velocity", 0),
            "rank_all": row.get("rank_all"),
            "rank_kr": row.get("rank_kr"),
            "rank_global": row.get("rank_global"),
            "source_count": row.get("source_count", 0),
            "change_type": row.get("change_type", "stable"),
            "snapshot_at": now,
        }
        for row in rows
    ]

    await db.bulk_insert("keyword_history", history_rows)
    log.info("history_snapshot", count=len(history_rows))
    return len(history_rows)
