import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

/**
 * GET /api/trade/spike/status?userId=...
 * Return processed trade commands for a user from D1.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId query parameter" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const { results } = await env.DB.prepare(
    `SELECT id, user_id, symbol, side, amount, idempotency_key, processed_at
     FROM trade_command_log
     WHERE user_id = ?
     ORDER BY processed_at DESC`
  )
    .bind(userId)
    .all<{
      id: number;
      user_id: string;
      symbol: string;
      side: string;
      amount: string;
      idempotency_key: string;
      processed_at: string;
    }>();

  return NextResponse.json({
    userId,
    commands: results ?? [],
  });
}
