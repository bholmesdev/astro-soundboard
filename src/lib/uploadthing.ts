import { createUploadthing } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  sound: f({
    audio: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      return {};
    })
    .onUploadComplete((data) => {
      console.log("upload completed", data);
    }),
} satisfies FileRouter;

export type SoundUploadRouter = typeof uploadRouter;
