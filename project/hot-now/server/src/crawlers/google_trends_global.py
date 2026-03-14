"""Google Trends Global — pytrends for US/JP/GB (sync → asyncio.to_thread)."""

import asyncio
from datetime import datetime, timezone
from typing import Any

from src.crawlers.base import BaseCrawler

REGIONS = {
    "united_states": "us",
    "japan": "jp",
    "united_kingdom": "gb",
}


class GoogleTrendsGlobalCrawler(BaseCrawler):
    source = "google_trends_global"

    def _fetch_sync(self) -> list[dict[str, Any]]:
        from pytrends.request import TrendReq

        pytrends = TrendReq(hl="en-US", tz=0)
        results: list[dict[str, Any]] = []
        for pn, region in REGIONS.items():
            try:
                df = pytrends.trending_searches(pn=pn)
                for kw in df[0].tolist():
                    results.append({"keyword": kw, "region": region, "pn": pn})
            except Exception:
                continue
        return results

    async def crawl(self) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self._fetch_sync)

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        items = []
        rank_by_region: dict[str, int] = {}
        for item in raw:
            if not item.get("keyword"):
                continue
            region = item["region"]
            rank_by_region[region] = rank_by_region.get(region, 0) + 1
            items.append(
                {
                    "source": self.source,
                    "keyword": item["keyword"],
                    "raw_score": None,
                    "region": region,
                    "collected_at": now,
                    "metadata": {
                        "rank": rank_by_region[region],
                        "pn": item.get("pn", ""),
                    },
                }
            )
        return items
