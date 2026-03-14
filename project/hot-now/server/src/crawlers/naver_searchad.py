"""Naver Search Ads API — 키워드별 실제 월간 검색 횟수 조회."""

import asyncio
import base64
import hashlib
import hmac
import re
import time
from typing import Any

import aiohttp

from src.common.config import settings
from src.common import db
from src.common.logger import get_logger

log = get_logger("naver_searchad")

API_URL = "https://api.searchad.naver.com/keywordstool"
BATCH_SIZE = 5
REQUEST_DELAY = 1.0  # 요청 간격 (초)

# 한국어가 포함된 키워드만 (네이버니까)
_HAS_KOREAN = re.compile(r"[가-힣]")


def _is_queryable(keyword: str) -> bool:
    """Naver 검색광고 API에 보낼 수 있는 키워드인지 확인."""
    if not keyword or len(keyword) > 40:
        return False
    return bool(_HAS_KOREAN.search(keyword))


def _generate_signature(timestamp: str, method: str, uri: str) -> str:
    message = f"{timestamp}.{method}.{uri}"
    sign = hmac.new(
        settings.naver_ad_secret_key.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.b64encode(sign).decode("utf-8")


def _build_headers() -> dict[str, str]:
    timestamp = str(int(time.time() * 1000))
    signature = _generate_signature(timestamp, "GET", "/keywordstool")
    return {
        "X-Timestamp": timestamp,
        "X-API-KEY": settings.naver_ad_api_key,
        "X-Customer": settings.naver_ad_customer_id,
        "X-Signature": signature,
        "Content-Type": "application/json",
    }


async def get_search_volume(keywords: list[str]) -> dict[str, dict[str, int]]:
    """키워드별 월간 검색 횟수 조회.

    Returns:
        {"키워드": {"pc": 12100, "mobile": 45200, "total": 57300}, ...}
    """
    if not settings.naver_ad_api_key or not settings.naver_ad_secret_key:
        log.warning("searchad_skip", reason="no api credentials")
        return {}

    # 유효한 키워드만 필터
    valid_keywords = [kw for kw in keywords if _is_queryable(kw)]
    if not valid_keywords:
        return {}

    result: dict[str, dict[str, int]] = {}

    async with aiohttp.ClientSession() as session:
        for i in range(0, len(valid_keywords), BATCH_SIZE):
            batch = valid_keywords[i : i + BATCH_SIZE]
            headers = _build_headers()

            params = {
                "hintKeywords": ",".join(batch),
                "showDetail": "1",
            }

            try:
                async with session.get(API_URL, headers=headers, params=params) as resp:
                    if resp.status == 429:
                        log.warning("searchad_rate_limit", batch=i)
                        await asyncio.sleep(5.0)
                        continue
                    if resp.status != 200:
                        text = await resp.text()
                        log.warning("searchad_error", status=resp.status, body=text[:200])
                        continue
                    data = await resp.json()

                for item in data.get("keywordList", []):
                    kw = item.get("relKeyword", "")
                    if kw in batch:
                        pc = item.get("monthlyPcQcCnt", 0)
                        mobile = item.get("monthlyMobileQcCnt", 0)
                        if isinstance(pc, str):
                            pc = 10
                        if isinstance(mobile, str):
                            mobile = 10
                        result[kw] = {
                            "pc": pc or 0,
                            "mobile": mobile or 0,
                            "total": (pc or 0) + (mobile or 0),
                        }
            except Exception as exc:
                log.warning("searchad_batch_error", error=str(exc), keywords=batch)

            await asyncio.sleep(REQUEST_DELAY)

    return result


def _format_volume(total: int) -> str:
    if total >= 10000:
        return f"{total / 10000:.1f}만"
    if total >= 1000:
        return f"{total / 1000:.1f}천"
    return str(total)


async def update_search_volumes() -> int:
    """최근 trend_scores 키워드들의 검색 횟수를 업데이트."""
    score_result = await db.select(
        "trend_scores",
        columns="keyword",
        order_by="score",
        desc=True,
        limit=30,
    )
    keywords = [row["keyword"] for row in (score_result.data or [])]

    if not keywords:
        log.info("searchad_skip", reason="no keywords to query")
        return 0

    volumes = await get_search_volume(keywords)
    log.info("searchad_fetched", count=len(volumes))

    updated = 0
    client = db.get_client()
    for kw, vol in volumes.items():
        total = vol["total"]
        formatted = _format_volume(total)

        try:
            client.table("trend_scores").update({
                "search_volume": total,
                "search_volume_formatted": formatted,
            }).eq("keyword", kw).execute()
            updated += 1
        except Exception as exc:
            log.warning("searchad_update_error", keyword=kw, error=str(exc))

    log.info("searchad_done", updated=updated)
    return updated
