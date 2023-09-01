import { auth, githubAuth } from "../../../lib/lucia.js";
import { OAuthRequestError } from "@lucia-auth/oauth";

import type { APIRoute } from "astro";

export const get: APIRoute = async (context) => {
  const storedState = context.cookies.get("github_oauth_state")?.value;
  if (!storedState) return context.redirect("/login", 302);

  const state = context.url.searchParams.get("state");
  const code = context.url.searchParams.get("code");

  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    const { existingUser, githubUser, createUser } =
      await githubAuth.validateCallback(code);

    const getUser = async () => {
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          username: githubUser.login,
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    context.locals.auth.setSession(session);
    return context.redirect("/boards/", 302);
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      return e.response;
    }
    return new Response(null, {
      status: 500,
    });
  }
};
