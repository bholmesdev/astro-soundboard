import type { APIRoute } from "astro";
import { createServerHandler } from "uploadthing/server";
import { uploadRouter } from "@/lib/uploadthing";

const handlers = createServerHandler({
  router: uploadRouter,
  config: {
    uploadthingId: import.meta.env.UPLOADTHING_APPID,
    uploadthingSecret: import.meta.env.UPLOADTHING_SECRET,
    callbackUrl: "http://localhost:3000/api/uploadthing",
  },
});

export const GET: APIRoute = async ({ request }) => handlers.GET({ request });
export const POST: APIRoute = async ({ request }) => handlers.POST({ request });
