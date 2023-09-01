import { UploadButton } from "@uploadthing/react";
import type { SoundUploadRouter } from "@/lib/uploadthing";
import { Button, buttonVariants } from "./ui/button";
import { useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import type { UploadFileResponse } from "uploadthing/client";

type UploadedFile = Pick<UploadFileResponse, "key" | "url" | "name">;

export function AudioUploader({
  uploadedFile,
  soundId,
  onUpload,
}: {
  uploadedFile?: UploadedFile;
  soundId: string;
  onUpload?: (file: UploadedFile) => void;
}) {
  const [file, setFile] = useState<UploadedFile | null>(uploadedFile ?? null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <>
      {file ? (
        <div className="flex gap-2 items-center">
          <p className="text-gray-400">{file.name}</p>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const res = await fetch("/api/uploadthing", {
                method: "DELETE",
                body: JSON.stringify({ key: file.key, soundId }),
              });
              if (res.status === 200) {
                setFile(null);
              }
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      ) : (
        <UploadButton<SoundUploadRouter>
          endpoint="sound"
          className={buttonVariants({ variant: "outline" })}
          onClientUploadComplete={(files) => {
            const uploaded = files?.[0];
            if (!uploaded) return;

            setFile(uploaded);
            onUpload?.(uploaded);
          }}
          onUploadError={(e) => {
            setUploadError(e.message);
          }}
        />
      )}
      <input type="hidden" name="fileKey" value={file?.key ?? ""} />
      <input type="hidden" name="fileName" value={file?.name ?? ""} />
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />

      {uploadError ? (
        <p className="bg-red-200 px-2 py-1 rounded-md text-background">
          {uploadError}
        </p>
      ) : null}
    </>
  );
}
