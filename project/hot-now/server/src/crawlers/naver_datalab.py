"""Naver DataLab — RSS에서 발견된 트렌딩 키워드의 검색량을 조회."""

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any

import aiohttp

from src.common.config import settings
from src.common import db
from src.crawlers.base import BaseCrawler

# Naver DataLab API는 한 번에 최대 5개 키워드 그룹 비교 가능
MAX_GROUPS_PER_REQUEST = 5


class NaverDatalabCrawler(BaseCrawler):
    source = "naver_datalab"

    async def _get_trending_keywords(self) -> list[str]:
        """최근 raw_trends에서 google_trends_rss로 수집된 키워드 가져오기."""
        since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        rows = await db.get_recent_raw(since, source="google_trends_rss")
        keywords = list({
            row.get("keyword", "").strip()
            for row in rows
            if row.get("keyword", "").strip()
        })
        return keywords

    async def _query_datalab(
        self,
        session: aiohttp.ClientSession,
        headers: dict[str, str],
        keyword_groups: list[dict[str, Any]],
        start: datetime,
        end: datetime,
    ) -> list[dict[str, Any]]:
        """Naver DataLab API 호출."""
        url = f"{settings.naver_api_url}/v1/datalab/search"
        body = {
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": end.strftime("%Y-%m-%d"),
            "timeUnit": "date",
            "keywordGroups": keyword_groups,
        }
        async with self.limiter:
            async with session.post(url, json=body, headers=headers) as resp:
                resp.raise_for_status()
                data = await resp.json()
        return data.get("results", [])

    async def crawl(self) -> list[dict[str, Any]]:
        if not settings.naver_client_id or not settings.naver_client_secret:
            self.log.warning("naver_datalab_skip", reason="no api credentials")
            return []

        # RSS에서 발견된 트렌딩 키워드 가져오기
        trending = await self._get_trending_keywords()
        if not trending:
            self.log.info("naver_datalab_skip", reason="no trending keywords from RSS")
            return []

        self.log.info("naver_datalab_keywords", count=len(trending))

        end = datetime.now(timezone.utc)
        start = end - timedelta(days=7)
        headers = {
            "X-Naver-Client-Id": settings.naver_client_id,
            "X-Naver-Client-Secret": settings.naver_client_secret,
            "Content-Type": "application/json",
        }

        results: list[dict[str, Any]] = []
        async with aiohttp.ClientSession() as session:
            # 키워드를 5개씩 묶어서 API 호출
            for i in range(0, len(trending), MAX_GROUPS_PER_REQUEST):
                batch = trending[i : i + MAX_GROUPS_PER_REQUEST]
                groups = [
                    {"groupName": kw, "keywords": [kw]}
                    for kw in batch
                ]

                try:
                    batch_results = await self._query_datalab(
                        session, headers, groups, start, end
                    )
                    results.extend(batch_results)
                except Exception as exc:
                    self.log.warning(
                        "naver_datalab_batch_error",
                        error=str(exc),
                        keywords=batch,
                    )

                await asyncio.sleep(0.1)

        return results

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        items = []
        for result in raw:
            keywords = result.get("keywords", [])
            data_points = result.get("data", [])
            latest = data_points[-1] if data_points else {}
            title = result.get("title", "")

            for kw in keywords:
                items.append({
                    "source": self.source,
                    "keyword": kw,
                    "raw_score": latest.get("ratio"),
                    "region": "kr",
                    "collected_at": now,
                    "metadata": {
                        "group": title,
                        "period": latest.get("period", ""),
                        "title": title,
                    },
                })

        return items
