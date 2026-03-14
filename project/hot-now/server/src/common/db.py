from typing import Any

from supabase import create_client
from supabase.client import Client

from src.common.config import settings

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
        _client = create_client(settings.supabase_url, settings.supabase_key)
    return _client


async def insert(table: str, data: dict[str, Any]) -> Any:
    return get_client().table(table).insert(data).execute()


async def upsert(
    table: str, data: dict[str, Any], on_conflict: str = "id"
) -> Any:
    return get_client().table(table).upsert(data, on_conflict=on_conflict).execute()


async def bulk_insert(table: str, data: list[dict[str, Any]]) -> Any:
    if not data:
        return None
    return get_client().table(table).insert(data).execute()


async def bulk_upsert(
    table: str, data: list[dict[str, Any]], on_conflict: str = "id"
) -> Any:
    if not data:
        return None
    return get_client().table(table).upsert(data, on_conflict=on_conflict).execute()


async def select(
    table: str,
    columns: str = "*",
    filters: dict[str, Any] | None = None,
    order_by: str | None = None,
    desc: bool = True,
    limit: int = 100,
) -> Any:
    query = get_client().table(table).select(columns).limit(limit)
    if filters:
        for col, val in filters.items():
            query = query.eq(col, val)
    if order_by:
        query = query.order(order_by, desc=desc)
    return query.execute()


async def upsert_keyword(data: dict[str, Any]) -> Any:
    return (
        get_client()
        .table("normalized_keywords")
        .upsert(data, on_conflict="keyword")
        .execute()
    )


async def get_keyword_id(keyword: str) -> str | None:
    resp = (
        get_client()
        .table("normalized_keywords")
        .select("id")
        .eq("keyword", keyword)
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]["id"]
    return None


async def get_recent_raw(
    since: str, source: str | None = None, limit: int = 1000
) -> list[dict[str, Any]]:
    query = (
        get_client()
        .table("raw_trends")
        .select("*")
        .gte("collected_at", since)
        .order("collected_at", desc=True)
        .limit(limit)
    )
    if source:
        query = query.eq("source", source)
    result = query.execute()
    return result.data if result.data else []
