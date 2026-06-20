/// <reference types="@cloudflare/workers-types" />

// Custom Worker entrypoint for OpenNext + Cloudflare.
//
// OpenNext generates `.open-next/worker.js` with a `fetch` handler. We wrap it
// here to also expose a Cloudflare Queue consumer and a custom Durable Object
// (`SessionDO`) while preserving the standard Next.js request handling.

// @ts-ignore `.open-next/worker.js` is generated at build time.
import { default as openNextHandler } from "../.open-next/worker.js";

export { SessionDO } from "./lib/durable-objects/SessionDO";

// Re-export internal OpenNext Durable Object classes so existing caching
// bindings continue to work if they are configured. These are no-ops when
// the corresponding bindings are absent.
// @ts-ignore `.open-next/worker.js` is generated at build time.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";

interface TradeCommand {
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: string;
  idempotencyKey: string;
}

export default {
  fetch: openNextHandler.fetch,

  async queue(batch, env, _ctx) {
    for (const message of batch.messages) {
      try {
        const command = message.body as TradeCommand;
        if (
          !command?.userId ||
          !command?.symbol ||
          !command?.side ||
          !command?.amount ||
          !command?.idempotencyKey
        ) {
          console.error("Malformed trade command in queue:", command);
          message.ack();
          continue;
        }

        // Route to the per-user Durable Object instance. Each user gets a
        // stable object ID derived from their userId, guaranteeing serial
        // execution of commands for that user.
        const objectId = env.SESSION_DO.idFromName(command.userId);
        const stub = env.SESSION_DO.get(objectId);

        const response = await stub.fetch(
          new Request("http://internal/process-trade-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(command),
          })
        );

        if (!response.ok) {
          const text = await response.text();
          console.error(
            `SessionDO returned ${response.status} for user ${command.userId}: ${text}`
          );
          message.retry();
          continue;
        }

        message.ack();
      } catch (err) {
        console.error("Queue consumer failed to process message:", err);
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;
