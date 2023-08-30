import { Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

export const PUT: APIRoute = async ({ request, params }) => {
  const { soundId } = params;
  if (typeof soundId !== "string") {
    return new Response("Invalid soundId", { status: 400 });
  }

  const formData = await request.formData();
  const url = formData.get("url");
  if (typeof url !== "string") {
    return new Response("Invalid url", { status: 400 });
  }

  await db.update(Sound).set({ url }).where(eq(Sound.id, soundId));

  return new Response(JSON.stringify({ soundId, url }));
};
