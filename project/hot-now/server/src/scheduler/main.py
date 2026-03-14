"""Scheduler — APScheduler for crawlers + AI pipeline."""

import asyncio
import signal

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.common.logger import get_logger
from src.crawlers import ALL_CRAWLERS

log = get_logger("scheduler")

# 크롤러별 주기 (분)
SCHEDULE: dict[int, list[str]] = {
    5: ["google_trends_rss", "google_trends_rss_global", "naver_datalab"],
    15: ["google_trends_kr", "google_trends_global"],
}


async def run_crawler(source: str) -> None:
    crawler_cls = ALL_CRAWLERS.get(source)
    if not crawler_cls:
        log.error("unknown_source", source=source)
        return

    try:
        crawler = crawler_cls()
        items = await crawler.run()
        log.info("crawler_done", source=source, count=len(items))
    except Exception as exc:
        log.error("crawler_failed", source=source, error=str(exc))


async def run_pipeline_job(job_name: str, func) -> None:
    try:
        result = await func()
        log.info("pipeline_job_done", job=job_name, result=result)
    except Exception as exc:
        log.error("pipeline_job_failed", job=job_name, error=str(exc))


def build_scheduler() -> AsyncIOScheduler:
    from src.pipeline.classifier import run_classifier
    from src.pipeline.normalizer import run_normalizer
    from src.pipeline.sensitivity import run_sensitivity
    from src.pipeline.summarizer import summarize_top_keywords
    from src.scoring.calculator import calculate_scores
    from src.scoring.change_detector import snapshot_history
    from src.crawlers.naver_searchad import update_search_volumes

    scheduler = AsyncIOScheduler()

    # --- Crawler jobs ---
    for interval_minutes, sources in SCHEDULE.items():
        for source in sources:
            scheduler.add_job(
                run_crawler,
                "interval",
                minutes=interval_minutes,
                args=[source],
                id=f"crawl_{source}",
                name=f"Crawl {source}",
                max_instances=1,
                misfire_grace_time=60,
            )
            log.info("job_registered", source=source, interval=f"{interval_minutes}m")

    # --- Pipeline jobs (5분 주기) ---
    pipeline_5min = {
        "normalizer": run_normalizer,
        "sensitivity": run_sensitivity,
        "scoring": calculate_scores,
        "search_volume": update_search_volumes,
        "summarizer": summarize_top_keywords,
    }
    for name, func in pipeline_5min.items():
        scheduler.add_job(
            run_pipeline_job,
            "interval",
            minutes=5,
            args=[name, func],
            id=f"pipeline_{name}",
            name=f"Pipeline {name}",
            max_instances=1,
            misfire_grace_time=120,
        )
        log.info("pipeline_registered", job=name, interval="5m")

    # --- Pipeline jobs (15분 주기) ---
    scheduler.add_job(
        run_pipeline_job,
        "interval",
        minutes=15,
        args=["classifier", run_classifier],
        id="pipeline_classifier",
        name="Pipeline classifier",
        max_instances=1,
        misfire_grace_time=120,
    )
    log.info("pipeline_registered", job="classifier", interval="15m")

    # --- History snapshot (매시간) ---
    scheduler.add_job(
        run_pipeline_job,
        "interval",
        minutes=60,
        args=["history", snapshot_history],
        id="pipeline_history",
        name="Pipeline history",
        max_instances=1,
        misfire_grace_time=300,
    )
    log.info("pipeline_registered", job="history", interval="60m")

    return scheduler


async def async_main() -> None:
    log.info("scheduler_start")

    scheduler = build_scheduler()
    scheduler.start()

    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop_event.set)

    log.info("scheduler_running", jobs=len(scheduler.get_jobs()))
    await stop_event.wait()

    log.info("scheduler_shutdown")
    scheduler.shutdown(wait=True)
    log.info("scheduler_stopped")


def main() -> None:
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
