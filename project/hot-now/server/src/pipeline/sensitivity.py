"""Sensitivity detector — flag sensitive/unsafe keywords via Haiku."""

import json
from datetime import datetime, timedelta, timezone

from src.common import db
from src.common.logger import get_logger
from src.pipeline.llm import call_haiku

log = get_logger("sensitivity")

SYSTEM_PROMPT = """당신은 콘텐츠 안전성 판별 전문가입니다.
트렌드 키워드가 서비스에 노출하기에 적절한지 판단합니다.

민감 기준:
- L1_BLOCK: 즉시 차단 — 성인 콘텐츠, 불법 도박, 마약, 극단적 폭력, 혐오 표현
- L2_REVIEW: 검토 필요 — 정치 편향, 특정 정당/후보 홍보, 종교 갈등, 자극적 사건
- L3_ELECTION: 선거 관련 — 후보자명, 정당명, 선거 관련 키워드
- SAFE: 안전 — 노출 가능

규칙:
1. 키워드 자체뿐 아니라 맥락도 고려
2. 애매하면 SAFE보다는 L2_REVIEW (안전 우선)
3. 정치인 이름 자체는 SAFE이지만, "XX 지지" "XX 반대" 등은 L2_REVIEW
4. JSON 배열로만 응답"""

VALID_LEVELS = {"SAFE", "L1_BLOCK", "L2_REVIEW", "L3_ELECTION"}
BATCH_SIZE = 50


def _format_user_prompt(keywords: list[dict]) -> str:
    items = json.dumps(keywords, ensure_ascii=False, indent=2)
    return f"""다음 키워드들의 민감도를 판별해주세요.

{items}

JSON 형식:
[
  {{
    "keyword": "키워드",
    "level": "SAFE|L1_BLOCK|L2_REVIEW|L3_ELECTION",
    "reason": "판단 근거",
    "action": "show|hide|review"
  }}
]"""


async def check_sensitivity_batch(keywords: list[dict]) -> list[dict]:
    if not keywords:
        return []

    try:
        result = await call_haiku(SYSTEM_PROMPT, _format_user_prompt(keywords))
        if not isinstance(result, list):
            result = [result]

        for item in result:
            if item.get("level") not in VALID_LEVELS:
                item["level"] = "L2_REVIEW"
                item["action"] = "review"

        return result
    except (json.JSONDecodeError, KeyError) as exc:
        log.error("sensitivity_batch_failed", error=str(exc))
        return [
            {"keyword": kw["keyword"], "level": "L2_REVIEW", "reason": "판별 실패", "action": "review"}
            for kw in keywords
        ]


async def run_sensitivity() -> int:
    since = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    raw_rows = await db.get_recent_raw(since)

    if not raw_rows:
        return 0

    new_keywords = list({
        row.get("keyword", "").strip()
        for row in raw_rows
        if row.get("keyword", "").strip()
    })

    existing = await db.select(
        "normalized_keywords",
        columns="keyword,is_sensitive",
        limit=5000,
    )
    checked = {
        row["keyword"]
        for row in (existing.data or [])
        if row.get("is_sensitive") is not None
    }
    to_check = [{"keyword": kw} for kw in new_keywords if kw not in checked]

    if not to_check:
        log.info("sensitivity_skip", reason="all keywords already checked")
        return 0

    total = 0
    for i in range(0, len(to_check), BATCH_SIZE):
        batch = to_check[i : i + BATCH_SIZE]
        results = await check_sensitivity_batch(batch)

        for item in results:
            is_sensitive = item["level"] != "SAFE"
            await db.upsert_keyword({
                "keyword": item["keyword"],
                "is_sensitive": is_sensitive,
                "sensitivity_level": item["level"],
                "sensitivity_reason": item.get("reason"),
            })
            total += 1

    log.info("sensitivity_done", checked=total)
    return total
