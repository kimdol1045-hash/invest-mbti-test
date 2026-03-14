from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # LLM
    anthropic_api_key: str = ""

    # Naver DataLab
    naver_client_id: str = ""
    naver_client_secret: str = ""
    naver_api_url: str = "https://openapi.naver.com"

    # Naver Search Ads (검색광고 키워드 도구)
    naver_ad_customer_id: str = ""
    naver_ad_api_key: str = ""
    naver_ad_secret_key: str = ""

    # AI Pipeline
    ai_daily_budget: float = Field(default=1.0)

    # App
    log_level: str = Field(default="INFO")


settings = Settings()
