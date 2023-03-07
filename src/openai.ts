import { Configuration, OpenAIApi } from "openai";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

class OpenAI {
  private readonly client: OpenAIApi;
  public static readonly MODELS = {
    chatGPT: "gpt-3.5-turbo",
  };
  public static readonly MAX_TOKENS = 4000;
  public static readonly TIMEOUT = 100000;

  public constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
      baseOptions: {
        adapter: fetchAdapter,
      },
    });
    this.client = new OpenAIApi(configuration);
  }

  public async chatGPT(prompt: string) {
    return await this.client.createCompletion(
      {
        prompt,
        model: OpenAI.MODELS.chatGPT,
        max_tokens: OpenAI.MAX_TOKENS,
      },
      {
        timeout: OpenAI.TIMEOUT,
      }
    );
  }
}

export default OpenAI;
