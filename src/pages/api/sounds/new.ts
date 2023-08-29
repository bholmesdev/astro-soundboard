import { Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { z } from "zod";

const payload = z.object({
  boardId: z.string().uuid(),
});

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { boardId } = payload.parse(data);

  const [sound] = await db
    .insert(Sound)
    .values({
      boardId,
    })
    .returning();

  return new Response(JSON.stringify(sound), {
    headers: { "Content-Type": "application/json" },
  });
};
