import OpenAI from "openai";
import { settings } from "../config.js";

class LLMClient extends OpenAI {
  _model: string;

  constructor() {
    super({
      baseURL: settings.llmBaseUrl,
      apiKey: settings.llmApiKey,
    });

    this._model = settings.llmModel;
  }
}

export const llmClient = new LLMClient();
