import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";

export const runtime = "nodejs";

async function handler(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth(env as unknown as Parameters<typeof createAuth>[0]);
  return auth.handler(req);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
