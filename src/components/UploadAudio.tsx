import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export function UploadAudio() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center  gap-16 p-24">
      <div className="flex flex-col items-center justify-center gap-4">
        <span className="text-center text-4xl font-bold">
          {`Upload a file using a button:`}
        </span>

        <UploadButton<OurFileRouter>
          endpoint="videoAndImage"
          onClientUploadComplete={console.log}
          onUploadError={console.log}
        />
      </div>
    </main>
  );
}
