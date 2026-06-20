import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

type CloudflareAuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
};

export function createAuth(env: CloudflareAuthEnv) {
  const db = new Kysely({
    dialect: new D1Dialect({ database: env.DB }),
  });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL,
    database: kyselyAdapter(db, {
      type: "sqlite",
      transaction: false, // D1 does not support transactions
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      // Stubs for Phase 1; keep disabled until credentials are configured.
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        enabled: false,
      },
      microsoft: {
        clientId: env.MICROSOFT_CLIENT_ID || "",
        clientSecret: env.MICROSOFT_CLIENT_SECRET || "",
        enabled: false,
      },
    },
  });
}
