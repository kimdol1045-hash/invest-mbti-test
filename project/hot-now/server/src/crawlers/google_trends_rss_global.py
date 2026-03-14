"""Google Trends RSS Global — 해외 실시간 급상승 검색어 (US, JP, GB)."""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

import aiohttp

from src.crawlers.base import BaseCrawler

NS = {"ht": "https://trends.google.com/trending/rss"}

GEOS = {
    "US": "us",
    "JP": "jp",
    "GB": "gb",
}


class GoogleTrendsRSSGlobalCrawler(BaseCrawler):
    source = "google_trends_rss_global"

    async def crawl(self) -> list[dict[str, Any]]:
        all_items: list[dict[str, Any]] = []

        async with aiohttp.ClientSession() as session:
            for geo, region in GEOS.items():
                url = f"https://trends.google.com/trending/rss?geo={geo}"
                try:
                    async with session.get(url) as resp:
                        resp.raise_for_status()
                        text = await resp.text()

                    root = ET.fromstring(text)
                    for item in root.findall(".//item"):
                        title = item.findtext("title", "").strip()
                        if not title:
                            continue

                        traffic = item.findtext("ht:approx_traffic", "", NS).replace("+", "").replace(",", "")
                        pub_date = item.findtext("pubDate", "")
                        picture = item.findtext("ht:picture", "", NS)

                        news_items = []
                        for ni in item.findall("ht:news_item", NS):
                            news_title = ni.findtext("ht:news_item_title", "", NS)
                            news_source = ni.findtext("ht:news_item_source", "", NS)
                            if news_title:
                                news_items.append({
                                    "title": news_title,
                                    "source": news_source,
                                })

                        all_items.append({
                            "keyword": title,
                            "traffic": traffic,
                            "geo": geo,
                            "region": region,
                            "pub_date": pub_date,
                            "picture": picture,
                            "news": news_items,
                        })
                except Exception as exc:
                    self.log.warning("rss_global_error", geo=geo, error=str(exc))

        return all_items

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        items = []
        rank_by_region: dict[str, int] = {}

        for item in raw:
            region = item["region"]
            rank_by_region[region] = rank_by_region.get(region, 0) + 1

            try:
                traffic = int(item.get("traffic", "0") or "0")
            except ValueError:
                traffic = 0

            items.append({
                "source": self.source,
                "keyword": item["keyword"],
                "raw_score": traffic if traffic > 0 else None,
                "region": region,
                "collected_at": now,
                "metadata": {
                    "rank": rank_by_region[region],
                    "geo": item.get("geo", ""),
                    "traffic": item.get("traffic", ""),
                    "picture": item.get("picture", ""),
                    "news": item.get("news", [])[:2],
                    "pub_date": item.get("pub_date", ""),
                },
            })

        return items
