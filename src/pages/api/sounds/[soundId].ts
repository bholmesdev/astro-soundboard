import { Board, Sound, db } from "@/lib/schema";
import { soundValidator } from "@/lib/utils";
import type { APIRoute } from "astro";
import { and, eq, exists } from "drizzle-orm";

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const { soundId } = params;
  if (typeof soundId !== "string") {
    return new Response("Invalid soundId", { status: 400 });
  }

  const json = await request.json();
  const parsed = soundValidator.partial().safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  const boardQuery = db
    .select({ boardId: Board.id })
    .from(Sound)
    .innerJoin(Board, eq(Sound.boardId, Board.id))
    .where(and(eq(Board.userId, session.user.userId), eq(Sound.id, soundId)));

  const updated = await db
    .update(Sound)
    .set(parsed.data)
    .where(and(eq(Sound.id, soundId), exists(boardQuery)))
    .returning({ id: Sound.id });

  if (updated.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }));
};
