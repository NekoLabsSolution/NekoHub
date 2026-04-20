import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

loadEnvConfig(process.cwd());

function toDirectUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hostname = parsed.hostname.replace("-pooler.", ".");
  parsed.searchParams.delete("channel_binding");
  return parsed.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: toDirectUrl(env("DATABASE_URL")),
    shadowDatabaseUrl: toDirectUrl(env("SHADOW_DATABASE_URL")),
  },
});
