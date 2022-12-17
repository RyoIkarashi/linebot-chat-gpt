import { WebhookEvent } from "@line/bot-sdk";
import { Hono } from "hono";
import LineBot from "./line-bot";
import OpenAI from "./openai";
import { validateSignature } from "./middleware/validate-signature";

const app = new Hono();

app.use("/api/webhook", validateSignature());

app.post("/api/webhook", async (c) => {
  const openai = new OpenAI(c.env.OPENAI_API_KEY);
  const lineBot = new LineBot(
    c.env.CHANNEL_ACCESS_TOKEN,
    c.env.CHANNEL_SECRET,
    openai
  );
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as { events: WebhookEvent[] }).events;

  await Promise.all(
    events.map((event: WebhookEvent) => {
      try {
        return c.executionCtx.waitUntil(lineBot.reply(event));
      } catch (err: unknown) {
        return c.json({ message: "something went wrong :(" });
      }
    })
  );

  return c.json({ message: "ok" });
});

export default app;
