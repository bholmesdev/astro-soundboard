import { UploadButton } from "@uploadthing/react";
import type { SoundUploadRouter } from "@/lib/uploadthing";
import { Button } from "./ui/button";
import { useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import type { UploadFileResponse } from "uploadthing/client";

export type UploadedFile = Pick<UploadFileResponse, "key" | "url" | "name">;

export function AudioUploader({
  uploadedFile,
  soundId,
  onChange,
}: {
  uploadedFile?: UploadedFile;
  soundId?: string;
  onChange?: (file: UploadedFile | null) => void;
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
                onChange?.(null);
              }
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      ) : (
        <UploadButton<SoundUploadRouter>
          endpoint="sound"
          onClientUploadComplete={(files) => {
            const uploaded = files?.[0];
            if (!uploaded) return;

            setFile(uploaded);
            onChange?.(uploaded);
          }}
          onUploadError={(e) => {
            setUploadError(e.message);
          }}
        />
      )}

      {uploadError ? (
        <p className="bg-red-200 px-2 py-1 rounded-md text-background">
          {uploadError}
        </p>
      ) : null}
    </>
  );
}
