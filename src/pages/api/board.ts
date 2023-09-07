import { db, Board } from "@/lib/schema";
import { boardValidator } from "@/lib/utils";
import type { APIRoute } from "astro";
import { and, eq, exists } from "drizzle-orm";

export const PATCH: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const json = await request.json();
  const parsed = boardValidator
    .partial()
    .extend({
      id: boardValidator.shape.id,
    })
    .safeParse(json);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  const board = parsed.data;
  const updated = await db
    .update(Board)
    .set(board)
    .where(
      and(
        eq(Board.id, board.id),
        exists(
          db
            .select({ boardId: Board.id })
            .from(Board)
            .where(
              and(eq(Board.userId, session.user.userId), eq(Board.id, board.id))
            )
        )
      )
    )
    .returning();

  if (updated.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null);
};
