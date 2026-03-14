from src.crawlers.google_trends_rss import GoogleTrendsRSSCrawler
from src.crawlers.google_trends_rss_global import GoogleTrendsRSSGlobalCrawler
from src.crawlers.google_trends_kr import GoogleTrendsKRCrawler
from src.crawlers.google_trends_global import GoogleTrendsGlobalCrawler
from src.crawlers.naver_datalab import NaverDatalabCrawler

ALL_CRAWLERS: dict[str, type] = {
    "google_trends_rss": GoogleTrendsRSSCrawler,
    "google_trends_rss_global": GoogleTrendsRSSGlobalCrawler,
    "google_trends_kr": GoogleTrendsKRCrawler,
    "google_trends_global": GoogleTrendsGlobalCrawler,
    "naver_datalab": NaverDatalabCrawler,
}
