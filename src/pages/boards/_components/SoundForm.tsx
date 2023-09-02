import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef, useState, type FormEvent, useReducer } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "@/lib/debounce";
import { soundCompleteValidator, soundValidator } from "@/lib/utils";
import { z } from "zod";
import { AudioUploader, type UploadedFile } from "@/components/AudioUploader";
import type { addSoundValidator } from "@/pages/api/sound";

const queryClient = new QueryClient();
type Sound = z.infer<typeof soundValidator>;

type SoundsFormProps = {
  boardId: string;
  initialSounds: Sound[];
};

export function Sounds(props: SoundsFormProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SoundsMutation {...props} />
    </QueryClientProvider>
  );
}

function SoundsMutation({ initialSounds, boardId }: SoundsFormProps) {
  const [sounds, setSounds] = useState(initialSounds);

  return (
    <>
      {sounds.map((s) => (
        <SoundFormMutation key={s.id} {...s} />
      ))}
      <AddSoundForm
        boardId={boardId}
        onSuccess={(s) => setSounds((prev) => [...prev, s])}
      />
    </>
  );
}

function AddSoundForm({
  boardId,
  onSuccess,
}: {
  boardId: string;
  onSuccess: (s: Sound) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const isComplete = name.length > 0 && file;

  const soundAdd = useMutation({
    async mutationFn(p: { name: string; file: UploadedFile }) {
      const s: z.infer<typeof addSoundValidator> = {
        boardId,
        name: p.name,
        fileName: p.file.name,
        fileUrl: p.file.url,
        fileKey: p.file.key,
      };
      const res = await fetch(`/api/sound`, {
        method: "POST",
        body: JSON.stringify(s),
      });
      const json = await res.json();
      return soundValidator.parse(json);
    },
    onSuccess,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isComplete) return;
        soundAdd.mutate({ name, file });
      }}
    >
      <Card>
        <CardHeader className="flex-row flex justify-between items-center gap-2">
          <Input
            required
            className="text-2xl"
            placeholder="New Sound"
            type="text"
            name="name"
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <AudioUploader onChange={(f) => setFile(f)} />
          <Button disabled={!isComplete} type="submit">
            Add
          </Button>
        </CardContent>
      </Card>
      {soundAdd.error ? (
        <CardFooter>
          <p className="text-red-500">Unexpected error creating sound.</p>
        </CardFooter>
      ) : null}
    </form>
  );
}

function SoundFormMutation(initial: Sound) {
  const soundUpdate = useMutation({
    mutationFn: async (s: Partial<Sound>) =>
      fetch(`/api/sound/`, {
        method: "PUT",
        body: JSON.stringify({ id: initial.id, ...s }),
      }),
  });

  const isComplete =
    soundUpdate.isSuccess || soundCompleteValidator.safeParse(initial).success;

  const debouncedName = useDebouncedCallback((name: string) => {
    soundUpdate.mutate({ name });
  }, 300);

  return (
    // `preventDefault`: Using `onChange` and
    // uploadthing callbacks to drive submissions
    <form onSubmit={(e) => e.preventDefault()}>
      <Card>
        <CardHeader className="flex-row flex justify-between items-center gap-2">
          <Input
            className="text-2xl"
            type="text"
            name="name"
            onFocus={(e) => e.target.select()}
            defaultValue={initial.name}
            onChange={(e) => debouncedName(e.target.value)}
          />
          {isComplete ? (
            <p className="bg-green-300 text-xs text-green-950 px-2 py-1 rounded-full">
              ✓ Updated
            </p>
          ) : (
            <p className="bg-yellow-100 text-xs text-yellow-950 px-2 py-1 rounded-full">
              ✗ Incomplete
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <AudioUploader
            soundId={initial.id}
            uploadedFile={
              initial.fileName && initial.fileUrl && initial.fileKey
                ? {
                    name: initial.fileName,
                    url: initial.fileUrl,
                    key: initial.fileKey,
                  }
                : undefined
            }
            onChange={(f) => {
              if (!f) return;
              soundUpdate.mutate({
                fileName: f.name,
                fileUrl: f.url,
                fileKey: f.key,
              });
            }}
          />
        </CardContent>
      </Card>
    </form>
  );
}
