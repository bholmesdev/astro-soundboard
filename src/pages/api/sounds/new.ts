import { Board, Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const payload = z.object({
  boardId: z.string().uuid(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  let data = {};
  try {
    data = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { boardId } = payload.parse(data);

  const board = await db
    .select({ boardId: Board.id })
    .from(Board)
    .where(and(eq(Board.userId, session.user.userId), eq(Board.id, boardId)));

  if (board.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const [sound] = await db
    .insert(Sound)
    .values({
      name: "New Sound",
      boardId,
    })
    .returning();

  return new Response(JSON.stringify(sound), {
    headers: { "Content-Type": "application/json" },
  });
};
