import { lucia } from "lucia";
import { astro } from "lucia/middleware";
import { pg } from "@lucia-auth/adapter-postgresql";
import { db } from "@vercel/postgres";

export const auth = lucia({
  env: import.meta.env.DEV ? "DEV" : "PROD",
  middleware: astro(),
  adapter: pg(db, {
    user: "auth_user",
    key: "user_key",
    session: "user_session",
  }),
  getUserAttributes(data) {
    return {
      username: data.username,
    };
  },
});

export type Auth = typeof auth;
