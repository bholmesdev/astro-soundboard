import { Board, Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { z } from "zod";

const payload = z.record(z.string().url());

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.json();
  const boardEntries = payload.parse(raw);

  const [, url] = Object.entries(boardEntries)[0];
  const [createdBoard] = await db.insert(Board).values({}).returning();

  await db.insert(Sound).values({
    url,
    boardId: createdBoard.id,
  });

  return new Response(
    JSON.stringify({
      boardId: createdBoard.id,
    })
  );
};
