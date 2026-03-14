"""Google Trends KR — pytrends trending_searches (sync → asyncio.to_thread)."""

import asyncio
from datetime import datetime, timezone
from typing import Any

from src.crawlers.base import BaseCrawler


class GoogleTrendsKRCrawler(BaseCrawler):
    source = "google_trends_kr"

    def _fetch_sync(self) -> list[str]:
        from pytrends.request import TrendReq

        pytrends = TrendReq(hl="ko", tz=540)
        df = pytrends.trending_searches(pn="south_korea")
        return df[0].tolist()

    async def crawl(self) -> list[dict[str, Any]]:
        keywords = await asyncio.to_thread(self._fetch_sync)
        return [{"keyword": kw} for kw in keywords]

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        return [
            {
                "source": self.source,
                "keyword": item["keyword"],
                "raw_score": None,
                "region": "kr",
                "collected_at": now,
                "metadata": {"rank": i + 1},
            }
            for i, item in enumerate(raw)
        ]
