"""Base crawler — crawl → normalize → save pipeline."""

import asyncio
import functools
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any

import structlog
from aiolimiter import AsyncLimiter

from src.common.db import bulk_insert
from src.common.logger import get_logger

# Source-specific rate limiters
_LIMITS: dict[str, tuple[int, float]] = {
    "google": (10, 60.0),
    "naver": (10, 1.0),
    "default": (30, 60.0),
}
_limiters: dict[str, AsyncLimiter] = {}


def _get_limiter(source: str) -> AsyncLimiter:
    if source not in _limiters:
        max_rate, period = _LIMITS.get(source, _LIMITS["default"])
        _limiters[source] = AsyncLimiter(max_rate, period)
    return _limiters[source]


def async_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> Callable:
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exc: Exception | None = None
            for attempt in range(1, max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as exc:
                    last_exc = exc
                    if attempt == max_retries:
                        break
                    delay = base_delay * (2 ** (attempt - 1))
                    await asyncio.sleep(delay)
            raise last_exc  # type: ignore[misc]
        return wrapper
    return decorator


class BaseCrawler(ABC):
    source: str = "unknown"

    def __init__(self) -> None:
        self.log: structlog.stdlib.BoundLogger = get_logger(
            f"crawler.{self.source}"
        )
        self.limiter = _get_limiter(self.source)

    @abstractmethod
    async def crawl(self) -> list[dict[str, Any]]:
        """Fetch raw data from the source."""

    @abstractmethod
    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Normalize raw data to a common schema."""

    async def save(self, items: list[dict[str, Any]]) -> None:
        await bulk_insert("raw_trends", items)

    @async_retry(max_retries=3)
    async def run(self) -> list[dict[str, Any]]:
        self.log.info("crawl_start")
        async with self.limiter:
            raw = await self.crawl()
        self.log.info("crawl_done", count=len(raw))

        items = self.normalize(raw)
        await self.save(items)
        self.log.info("save_done", count=len(items))
        return items
