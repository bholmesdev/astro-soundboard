import type { APIRoute } from "astro";
import { createServerHandler, utapi } from "uploadthing/server";
import { uploadRouter } from "@/lib/uploadthing";
import { z } from "zod";
import { Sound, db } from "@/lib/schema";
import { eq } from "drizzle-orm";

const handlers = createServerHandler({
  router: uploadRouter,
  config: {
    uploadthingId: import.meta.env.UPLOADTHING_APPID,
    uploadthingSecret: import.meta.env.UPLOADTHING_SECRET,
    callbackUrl: "http://localhost:3000/api/uploadthing",
  },
});

export const GET: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) return new Response(null, { status: 401 });
  return handlers.GET({ request });
};
export const POST: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) return new Response(null, { status: 401 });
  return handlers.POST({ request });
};

const deleteValidator = z.object({
  key: z.string(),
  soundId: z.string().uuid(),
});

export const DELETE: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) return new Response(null, { status: 401 });

  if (import.meta.env.DEV) {
    process.env.UPLOADTHING_APPID = import.meta.env.UPLOADTHING_APPID;
    process.env.UPLOADTHING_SECRET = import.meta.env.UPLOADTHING_SECRET;
  }

  const parsed = deleteValidator.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  const { key, soundId } = parsed.data;
  const updated = await db
    .update(Sound)
    .set({
      fileKey: null,
      fileUrl: null,
      fileName: null,
    })
    .where(eq(Sound.id, soundId))
    .returning();

  if (!updated.length) {
    return new Response(`No sound with id ${soundId}`, { status: 400 });
  }

  const { success } = await utapi.deleteFiles(key);
  if (!success) {
    return new Response("Uploadthing failed to delete files", { status: 500 });
  }

  return new Response(null, { status: 200 });
};
