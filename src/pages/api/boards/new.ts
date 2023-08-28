import { Board, Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const payload = z.record(z.string().url());

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.json();
  const boardEntries = payload.parse(raw);

  const [, url] = Object.entries(boardEntries)[0];

  const boardId = uuidv4();

  await db
    .insert(Board)
    .values({
      id: boardId,
    })
    .returning();
  await db.insert(Sound).values({
    id: uuidv4(),
    url,
    boardId,
  });

  return new Response(
    JSON.stringify({
      boardId,
    })
  );
};
