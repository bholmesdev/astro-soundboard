import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { AudioUploader } from "@/components/AudioUploader";

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

  const soundAdd = useMutation({
    async mutationFn() {
      const res = await fetch(`/api/sound`, {
        method: "POST",
        body: JSON.stringify({ boardId }),
      });
      const json = await res.json();
      const parsed = soundValidator.parse(json);
      return parsed;
    },
    async onSuccess(data) {
      setSounds((prev) => [...prev, data]);
    },
  });

  return (
    <>
      {sounds.map((s) => (
        <SoundFormMutation key={s.id} {...s} />
      ))}
      <Button onClick={() => soundAdd.mutate()}>Add</Button>
      {soundAdd.error ? (
        <p className="text-red-500">Unexpected error creating sound.</p>
      ) : null}
    </>
  );
}

function SoundFormMutation(initial: Sound) {
  const soundUpdate = useMutation({
    mutationFn: async (s: Partial<Sound>) =>
      fetch(`/api/sound`, {
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
            onUpload={(f) => {
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
