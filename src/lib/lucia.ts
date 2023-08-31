import { lucia } from "lucia";
import { astro } from "lucia/middleware";
import { pg } from "@lucia-auth/adapter-postgresql";
import { db } from "@vercel/postgres";
import { github } from "@lucia-auth/oauth/providers";

export const auth = lucia({
  env: import.meta.env.DEV ? "DEV" : "PROD",
  middleware: astro(),
  adapter: pg(db, {
    user: "auth_user",
    key: "user_key",
    session: "user_session",
  }),
  csrfProtection: import.meta.env.PROD,
  getUserAttributes(data) {
    return {
      username: data.username,
    };
  },
});

export const githubAuth = github(auth, {
  clientId: import.meta.env.GITHUB_CLIENT_ID,
  clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
});

export type Auth = typeof auth;
