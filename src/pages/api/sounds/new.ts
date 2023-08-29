import { Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";

export const POST: APIRoute = async () => {
  const [sound] = await db.insert(Sound).values({}).returning();

  return new Response(JSON.stringify(sound), {
    headers: { "Content-Type": "application/json" },
  });
};
