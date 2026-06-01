from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    postgres_port: int = 5432
    redis_port: int = 6380

    llm_base_url: str = "https://api.writer.com/v1"
    llm_api_key: str = ""
    llm_model: str = "palmyra-x5"

    model_config = SettingsConfigDict(env_file=".env")

    @computed_field
    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://interview:interview"
            f"@localhost:{self.postgres_port}/interview"
        )

    @computed_field
    @property
    def redis_url(self) -> str:
        return f"redis://localhost:{self.redis_port}"


settings = Settings()
