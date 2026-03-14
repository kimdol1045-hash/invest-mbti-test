"""Keyword normalizer — merge synonyms into canonical forms via Haiku."""

import json
from datetime import datetime, timedelta, timezone

from src.common import db
from src.common.logger import get_logger
from src.pipeline.llm import call_haiku

log = get_logger("normalizer")

SYSTEM_PROMPT = """당신은 검색 키워드 정규화 전문가입니다.

규칙:
1. 동일 의미의 키워드를 하나의 대표 형태로 통합
2. 대표 형태는 가장 일반적으로 사용되는 한국어 표현
3. 영어 키워드도 한국어 대표 형태에 매핑 (한국어가 없으면 영어 유지)
4. 약어, 줄임말, 오타도 포함
5. 결과는 JSON 배열로만 응답"""

BATCH_SIZE = 50


def _format_user_prompt(keywords: list[str]) -> str:
    numbered = "\n".join(f'{i+1}. "{kw}"' for i, kw in enumerate(keywords))
    return f"""다음 키워드들을 정규화해주세요.

키워드 목록:
{numbered}

JSON 형식:
[
  {{
    "normalized": "대표 한국어 키워드",
    "normalized_en": "영어 표현",
    "aliases": ["동의어1", "동의어2"],
    "category_hint": "기술|경제|스포츠|엔터|정치|생활 중 하나"
  }}
]"""


async def normalize_batch(keywords: list[str]) -> list[dict]:
    if not keywords:
        return []

    try:
        result = await call_haiku(SYSTEM_PROMPT, _format_user_prompt(keywords))
        if not isinstance(result, list):
            result = [result]

        all_aliases: set[str] = set()
        for group in result:
            all_aliases.update(group.get("aliases", []))

        unmapped = [kw for kw in keywords if kw not in all_aliases]
        for kw in unmapped:
            result.append({
                "normalized": kw,
                "normalized_en": kw,
                "aliases": [kw],
                "category_hint": "생활",
            })

        return result
    except (json.JSONDecodeError, KeyError) as exc:
        log.error("normalize_batch_failed", error=str(exc), count=len(keywords))
        return [
            {"normalized": kw, "normalized_en": kw, "aliases": [kw], "category_hint": "생활"}
            for kw in keywords
        ]


async def run_normalizer() -> int:
    since = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    raw_rows = await db.get_recent_raw(since)

    if not raw_rows:
        log.info("normalizer_skip", reason="no new raw data")
        return 0

    new_keywords: list[str] = list({
        row.get("keyword", "").strip()
        for row in raw_rows
        if row.get("keyword", "").strip()
    })

    if not new_keywords:
        return 0

    existing = await db.select("normalized_keywords", columns="keyword", limit=5000)
    existing_set = {row["keyword"] for row in (existing.data or [])}
    to_normalize = [kw for kw in new_keywords if kw not in existing_set]

    if not to_normalize:
        log.info("normalizer_skip", reason="all keywords already normalized")
        return 0

    total = 0
    for i in range(0, len(to_normalize), BATCH_SIZE):
        batch = to_normalize[i : i + BATCH_SIZE]
        groups = await normalize_batch(batch)

        now = datetime.now(timezone.utc).isoformat()
        for group in groups:
            await db.upsert_keyword({
                "keyword": group["normalized"],
                "normalized_en": group.get("normalized_en", ""),
                "aliases": group.get("aliases", []),
                "category": group.get("category_hint", "생활"),
                "last_seen": now,
            })
            total += 1

    log.info("normalizer_done", processed=total, skipped=len(new_keywords) - len(to_normalize))
    return total
