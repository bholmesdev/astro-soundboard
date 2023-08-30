import { Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { z } from "zod";

const payload = z.object({
  boardId: z.string().uuid(),
});

export const POST: APIRoute = async ({ request }) => {
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
