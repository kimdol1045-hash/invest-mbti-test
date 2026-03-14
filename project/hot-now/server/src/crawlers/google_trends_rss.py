"""Google Trends RSS — 실시간 급상승 검색어 (공식 RSS 피드, 차단 위험 없음)."""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

import aiohttp

from src.crawlers.base import BaseCrawler

RSS_URL = "https://trends.google.com/trending/rss?geo=KR"
NS = {"ht": "https://trends.google.com/trending/rss"}


class GoogleTrendsRSSCrawler(BaseCrawler):
    source = "google_trends_rss"

    async def crawl(self) -> list[dict[str, Any]]:
        async with aiohttp.ClientSession() as session:
            async with session.get(RSS_URL) as resp:
                resp.raise_for_status()
                text = await resp.text()

        root = ET.fromstring(text)
        items = []

        for item in root.findall(".//item"):
            title = item.findtext("title", "").strip()
            if not title:
                continue

            traffic = item.findtext("ht:approx_traffic", "", NS).replace("+", "").replace(",", "")
            pub_date = item.findtext("pubDate", "")
            picture = item.findtext("ht:picture", "", NS)

            # 뉴스 아이템 수집
            news_items = []
            for ni in item.findall("ht:news_item", NS):
                news_title = ni.findtext("ht:news_item_title", "", NS)
                news_url = ni.findtext("ht:news_item_url", "", NS)
                news_source = ni.findtext("ht:news_item_source", "", NS)
                if news_title:
                    news_items.append({
                        "title": news_title,
                        "url": news_url,
                        "source": news_source,
                    })

            items.append({
                "keyword": title,
                "traffic": traffic,
                "pub_date": pub_date,
                "picture": picture,
                "news": news_items,
            })

        return items

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        items = []

        for i, item in enumerate(raw):
            # traffic 문자열 → 숫자 (예: "200" → 200)
            try:
                traffic = int(item.get("traffic", "0") or "0")
            except ValueError:
                traffic = 0

            items.append({
                "source": self.source,
                "keyword": item["keyword"],
                "raw_score": traffic if traffic > 0 else None,
                "region": "kr",
                "collected_at": now,
                "metadata": {
                    "rank": i + 1,
                    "traffic": item.get("traffic", ""),
                    "picture": item.get("picture", ""),
                    "news": item.get("news", [])[:3],  # 상위 3개 뉴스만
                    "pub_date": item.get("pub_date", ""),
                },
            })

        return items
