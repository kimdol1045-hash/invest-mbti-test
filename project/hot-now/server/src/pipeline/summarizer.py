"""AI summarizer — generate 2~3 sentence summaries for top trending keywords."""

import json
from datetime import datetime, timezone

from src.common import db
from src.common.logger import get_logger
from src.pipeline.llm import call_haiku

log = get_logger("summarizer")

SYSTEM_PROMPT = """당신은 실시간 트렌드 키워드가 왜 화제인지 간결하게 설명하는 전문가입니다.

규칙:
1. 각 키워드에 대해 2~3문장으로 "왜 지금 떴는지" 설명
2. 사실 기반, 추측이나 의견 금지
3. 한국어로 작성, 해요체 사용 (~해요, ~있어요, ~됐어요)
4. 관련 키워드 5~7개도 함께 추출
5. JSON 배열로만 응답"""


def _format_user_prompt(keywords: list[dict]) -> str:
    items = json.dumps(keywords, ensure_ascii=False, indent=2)
    return f"""다음 트렌드 키워드들이 왜 떴는지 요약하고 관련 키워드를 추출해주세요.

{items}

JSON 형식:
[
  {{
    "keyword": "키워드",
    "summary": "왜 떴는지 2~3문장 요약 (해요체)",
    "related_keywords": ["관련1", "관련2", "관련3", "관련4", "관련5"]
  }}
]"""


async def summarize_top_keywords(top_n: int = 10) -> list[dict]:
    score_result = await db.select(
        "trend_scores",
        columns="keyword,score,rank_all",
        order_by="score",
        desc=True,
        limit=top_n,
    )
    top_keywords = score_result.data or []

    if not top_keywords:
        log.info("summarizer_skip", reason="no trend_scores data")
        return []

    prompt_items = [
        {
            "keyword": row["keyword"],
            "rank": row.get("rank_all", 0),
        }
        for row in top_keywords
    ]

    try:
        result = await call_haiku(SYSTEM_PROMPT, _format_user_prompt(prompt_items), max_tokens=4000)
        if not isinstance(result, list):
            result = [result]
    except (json.JSONDecodeError, KeyError, RuntimeError) as exc:
        log.error("summarizer_failed", error=str(exc))
        return []

    now = datetime.now(timezone.utc).isoformat()
    for item in result:
        await db.upsert(
            "keyword_summaries",
            {
                "keyword": item["keyword"],
                "summary": item.get("summary", ""),
                "related_keywords": item.get("related_keywords", []),
                "updated_at": now,
            },
            on_conflict="keyword",
        )

    log.info("summarizer_done", count=len(result))
    return result
