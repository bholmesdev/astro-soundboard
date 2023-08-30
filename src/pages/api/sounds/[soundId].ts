import { Sound, db } from "@/lib/schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const updateSoundValidator = zfd.formData({
  name: zfd.text(z.string().nonempty()),
  url: zfd.text(z.string().url()),
});

export const PUT: APIRoute = async ({ request, params }) => {
  const { soundId } = params;
  if (typeof soundId !== "string") {
    return new Response("Invalid soundId", { status: 400 });
  }

  const formData = await request.formData();
  const parsed = updateSoundValidator.safeParse(formData);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  await db.update(Sound).set(parsed.data).where(eq(Sound.id, soundId));

  return new Response(JSON.stringify({ success: true }));
};
