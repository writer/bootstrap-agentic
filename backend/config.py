from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://interview:interview@localhost:5432/interview"
    redis_url: str = "redis://localhost:6380"
    llm_base_url: str = "https://api.writer.com/v1"
    llm_api_key: str = ""
    llm_model: str = "palmyra-x5"

    model_config = {"env_file": ".env"}


settings = Settings()
