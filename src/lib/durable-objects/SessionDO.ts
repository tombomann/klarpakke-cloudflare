/// <reference types="@cloudflare/workers-types" />

import { DurableObject } from "cloudflare:workers";

export interface TradeCommand {
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: string;
  idempotencyKey: string;
}

/**
 * SessionDO processes trade commands serially per user.
 *
 * Because Cloudflare Durable Objects guarantee single-threaded execution per
 * object instance, commands for the same user (keyed by userId) are processed
 * sequentially. Different users run on different DO instances in parallel.
 *
 * Idempotency is enforced by a UNIQUE constraint on idempotency_key in D1,
 * checked explicitly before insert so duplicate commands are silently
 * deduplicated.
 */
export class SessionDO extends DurableObject<CloudflareEnv> {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let command: TradeCommand;
    try {
      command = (await request.json()) as TradeCommand;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { userId, symbol, side, amount, idempotencyKey } = command;
    if (!userId || !symbol || !side || !amount || !idempotencyKey) {
      return new Response(
        JSON.stringify({ error: "Missing required command fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Serial execution inside the DO means this check + insert is race-free
    // for commands forwarded to the same user instance.
    const existing = await this.env.DB.prepare(
      "SELECT id FROM trade_command_log WHERE idempotency_key = ?"
    )
      .bind(idempotencyKey)
      .first<{ id: number }>();

    if (existing) {
      return new Response(
        JSON.stringify({ deduplicated: true, idempotencyKey }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    await this.env.DB.prepare(
      `INSERT INTO trade_command_log
         (user_id, symbol, side, amount, idempotency_key)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(userId, symbol, side, amount, idempotencyKey)
      .run();

    return new Response(
      JSON.stringify({ processed: true, idempotencyKey }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
