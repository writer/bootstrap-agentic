from openai import AsyncOpenAI

from backend.config import settings


class LLMClient(AsyncOpenAI):
    """Thin wrapper around AsyncOpenAI to store the model name."""

    def __init__(self):
        super().__init__(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
        )
        self._model = settings.llm_model


llm_client = LLMClient()
