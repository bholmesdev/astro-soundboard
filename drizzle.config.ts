import type { Config } from "drizzle-kit";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: env.POSTGRES_PUSH_URL,
  },
} satisfies Config;
