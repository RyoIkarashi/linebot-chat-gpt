import { Context, Next } from "hono";
import OpenAI from "../openai";
import LineBot from "../line-bot";

export const validateSignature = () => {
  return async (c: Context, next: Next) => {
    const openai = new OpenAI(c.env.OPENAI_API_KEY);
    const lineBot = new LineBot(
      c.env.CHANNEL_ACCESS_TOKEN,
      c.env.CHANNEL_SECRET,
      openai
    );
    const body = await c.req.clone().text();
    const signature = c.req.headers.get(LineBot.X_LINE_SIGNATURE) ?? "";
    const isValidSignature = await lineBot.validateSignature(body, signature);

    if (!isValidSignature) {
      return new Response("Bad Request", { status: 400 });
    }

    await next();
  };
};
