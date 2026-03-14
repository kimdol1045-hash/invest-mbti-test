"""Category classifier — classify keywords into 6 categories via Haiku."""

import json

from src.common import db
from src.common.logger import get_logger
from src.pipeline.llm import call_haiku

log = get_logger("classifier")

SYSTEM_PROMPT = """당신은 트렌드 키워드 카테고리 분류 전문가입니다.

카테고리 목록 (반드시 이 중 하나만 선택):
- 기술: IT, AI, 반도체, 앱, 소프트웨어, 하드웨어, 과학
- 경제: 주식, 코인, 환율, 금리, 부동산, 기업 실적, 물가
- 스포츠: 축구, 야구, 농구, 올림픽, e스포츠, 격투기
- 엔터: 연예인, 드라마, 영화, 음악, 예능, 유튜버
- 정치: 선거, 정당, 외교, 법안, 국제 관계, 정부 정책
- 생활: 날씨, 음식, 건강, 여행, 교통, 교육

규칙:
1. 키워드 기반으로 가장 적합한 카테고리 하나 선택
2. 애매하면 키워드가 뜬 주된 이유 기준으로 판단
3. 경제+정치 겹치면: 정책/외교 → 정치, 시장/주가 → 경제
4. JSON 배열로만 응답"""

VALID_CATEGORIES = {"기술", "경제", "스포츠", "엔터", "정치", "생활"}
BATCH_SIZE = 100


def _format_user_prompt(keywords: list[dict]) -> str:
    items = json.dumps(keywords, ensure_ascii=False, indent=2)
    return f"""다음 키워드들의 카테고리를 분류해주세요.

{items}

JSON 형식:
[
  {{"keyword": "키워드", "category": "카테고리", "confidence": 0.0}}
]"""


async def classify_batch(keywords: list[dict]) -> list[dict]:
    if not keywords:
        return []

    try:
        result = await call_haiku(SYSTEM_PROMPT, _format_user_prompt(keywords))
        if not isinstance(result, list):
            result = [result]

        for item in result:
            if item.get("category") not in VALID_CATEGORIES:
                item["category"] = "생활"
                item["confidence"] = 0.3

        return result
    except (json.JSONDecodeError, KeyError) as exc:
        log.error("classify_batch_failed", error=str(exc))
        return [
            {"keyword": kw["keyword"], "category": "생활", "confidence": 0.0}
            for kw in keywords
        ]


async def run_classifier() -> int:
    result = await db.select(
        "normalized_keywords",
        columns="keyword,category",
        limit=500,
    )

    uncategorized = [
        {"keyword": row["keyword"]}
        for row in (result.data or [])
        if not row.get("category") or row["category"] == "미분류"
    ]

    if not uncategorized:
        log.info("classifier_skip", reason="no uncategorized keywords")
        return 0

    total = 0
    for i in range(0, len(uncategorized), BATCH_SIZE):
        batch = uncategorized[i : i + BATCH_SIZE]
        classified = await classify_batch(batch)

        for item in classified:
            await db.upsert_keyword({
                "keyword": item["keyword"],
                "category": item["category"],
            })
            total += 1

    log.info("classifier_done", classified=total)
    return total
