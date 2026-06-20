import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

export async function GET() {
  const { env } = getCloudflareContext();
  const db = env.DB;

  await db.prepare("INSERT INTO health_checks (checked_at) VALUES (datetime('now'))").run();

  const { results } = await db
    .prepare("SELECT COUNT(*) as count FROM health_checks")
    .all<{ count: number }>();

  return NextResponse.json({
    status: "ok",
    d1: {
      healthCheckCount: results[0]?.count ?? 0,
    },
  });
}
