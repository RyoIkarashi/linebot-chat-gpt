import OpenAI from "./openai";
import { WebhookEvent } from "@line/bot-sdk";

class LineBot {
  private readonly channelAccessToken: string;
  private readonly channelSecret: string;
  private readonly openai: OpenAI;
  public static X_LINE_SIGNATURE = "x-line-signature";

  public constructor(
    channelAccessToken: string,
    channelSecret: string,
    openai: OpenAI
  ) {
    this.openai = openai;
    this.channelAccessToken = channelAccessToken;
    this.channelSecret = channelSecret;
  }

  public async reply(event: WebhookEvent) {
    if (event.type !== "message" || event.message.type !== "text") {
      return;
    }

    const completion = await this.openai.chatGPT(event.message.text);
    await fetch("https://api.line.me/v2/bot/message/reply", {
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: completion.data.choices[0].message ?? "huh?",
          },
        ],
      }),
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.channelAccessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  public async validateSignature(body: string, signature: string) {
    const enc = new TextEncoder();
    const algorithm = { name: "HMAC", hash: "SHA-256" };

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(this.channelSecret),
      algorithm,
      false,
      ["sign", "verify"]
    );

    const sign = await crypto.subtle.sign(
      algorithm.name,
      key,
      enc.encode(body)
    );

    const digest = btoa(String.fromCharCode(...new Uint8Array(sign)));

    return signature === digest;
  }
}

export default LineBot;
