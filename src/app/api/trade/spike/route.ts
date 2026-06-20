import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

interface TradeCommandBody {
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: string | number;
  idempotencyKey: string;
}

function isValidSide(side: unknown): side is "BUY" | "SELL" {
  return side === "BUY" || side === "SELL";
}

function validateBody(body: unknown): TradeCommandBody {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }

  const b = body as Record<string, unknown>;
  const userId = b.userId;
  const symbol = b.symbol;
  const side = b.side;
  const amount = b.amount;
  const idempotencyKey = b.idempotencyKey;

  if (
    typeof userId !== "string" ||
    typeof symbol !== "string" ||
    !isValidSide(side) ||
    (typeof amount !== "string" && typeof amount !== "number") ||
    typeof idempotencyKey !== "string"
  ) {
    throw new Error("Invalid or missing fields");
  }

  return { userId, symbol, side, amount: String(amount), idempotencyKey };
}

/**
 * POST /api/trade/spike
 * Enqueue a trade command to be processed by Queue -> SessionDO -> D1.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let command: TradeCommandBody;
  try {
    command = validateBody(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 400 }
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.TRADE_COMMANDS_QUEUE.send(command);

  return NextResponse.json({ enqueued: true, idempotencyKey: command.idempotencyKey });
}
