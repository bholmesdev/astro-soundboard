import { Board, Sound, db } from "@/lib/schema";
import { soundCompleteValidator, soundValidator } from "@/lib/utils";
import type { APIRoute } from "astro";
import { and, eq, exists } from "drizzle-orm";

export const addSoundValidator = soundCompleteValidator.omit({ id: true });

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
    });
  }
  const { boardId, ...values } = addSoundValidator.parse(data);

  const board = await db
    .select({ boardId: Board.id })
    .from(Board)
    .where(and(eq(Board.userId, session.user.userId), eq(Board.id, boardId)));

  if (board.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const inserted = await db
    .insert(Sound)
    .values({
      boardId,
      ...values,
    })
    .returning();

  if (!inserted.length) {
    return new Response("Failed to insert sound", { status: 500 });
  }

  return new Response(JSON.stringify(inserted[0]), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const json = await request.json();
  const parsed = soundValidator
    .partial()
    .extend({
      id: soundValidator.shape.id,
    })
    .safeParse(json);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  const sound = parsed.data;
  const boardQuery = db
    .select({ boardId: Board.id })
    .from(Sound)
    .innerJoin(Board, eq(Sound.boardId, Board.id))
    .where(and(eq(Board.userId, session.user.userId), eq(Sound.id, sound.id)));

  const updated = await db
    .update(Sound)
    .set(sound)
    .where(and(eq(Sound.id, sound.id), exists(boardQuery)))
    .returning({ id: Sound.id });

  if (updated.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null);
};
