import type { APIRoute } from "astro";
import { auth } from "@/lib/lucia";

export const POST: APIRoute = async (context) => {
  const session = await context.locals.auth.validate();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  await auth.invalidateSession(session.sessionId);
  context.locals.auth.setSession(null);
  return context.redirect("/", 302);
};
