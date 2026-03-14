"""LLM wrapper — Claude Haiku 4.5 with JSON parsing, retry, and cost tracking."""

import json
from datetime import date

import anthropic

from src.common.config import settings
from src.common.logger import get_logger

log = get_logger("llm")

_client: anthropic.AsyncAnthropic | None = None

HAIKU_MODEL = "claude-haiku-4-5-20251001"

PRICING = {
    HAIKU_MODEL: {"input": 0.80, "output": 4.00},
}


# --- Cost Tracker ---

class CostTracker:
    def __init__(self) -> None:
        self._daily_cost: float = 0.0
        self._date: date = date.today()

    def _maybe_reset(self) -> None:
        today = date.today()
        if today != self._date:
            log.info("cost_reset", previous_cost=round(self._daily_cost, 4))
            self._daily_cost = 0.0
            self._date = today

    async def record(self, model: str, input_tokens: int, output_tokens: int) -> None:
        self._maybe_reset()
        pricing = PRICING.get(model)
        if not pricing:
            return
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000
        self._daily_cost += cost
        log.debug(
            "token_usage",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=round(cost, 6),
            daily_total=round(self._daily_cost, 4),
        )

    def is_over_budget(self) -> bool:
        self._maybe_reset()
        return self._daily_cost > settings.ai_daily_budget

    def get_daily_cost(self) -> float:
        self._maybe_reset()
        return round(self._daily_cost, 6)


tracker = CostTracker()


# --- LLM Client ---

def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY must be set")
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


def _parse_json(text: str) -> dict | list:
    clean = text.strip()
    if clean.startswith("```"):
        first_newline = clean.find("\n")
        if first_newline != -1:
            clean = clean[first_newline + 1:]
        clean = clean.rsplit("```", 1)[0].strip()
    return json.loads(clean)


async def call_haiku(
    system: str, user: str, max_tokens: int = 2000
) -> dict | list:
    if tracker.is_over_budget():
        log.warning("budget_exceeded", daily_cost=tracker.get_daily_cost())
        raise RuntimeError("AI daily budget exceeded")

    client = _get_client()

    for attempt in range(2):
        response = await client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )

        await tracker.record(
            HAIKU_MODEL,
            response.usage.input_tokens,
            response.usage.output_tokens,
        )

        text = response.content[0].text
        try:
            return _parse_json(text)
        except json.JSONDecodeError:
            if attempt == 0:
                log.warning("json_parse_retry", text_preview=text[:200])
                user = user + "\n\n반드시 유효한 JSON만 출력하세요. 다른 텍스트 없이 JSON만."
            else:
                log.error("json_parse_failed", text_preview=text[:200])
                raise

    raise RuntimeError("LLM call failed")
