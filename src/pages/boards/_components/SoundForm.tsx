import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "@/lib/debounce";
import { cn, soundValidator } from "@/lib/utils";
import { z } from "zod";
import { AudioUploader, type UploadedFile } from "@/components/AudioUploader";
import type { addSoundValidator } from "@/pages/api/sound";
import { CheckIcon, Cross2Icon, ReloadIcon } from "@radix-ui/react-icons";

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
        e.currentTarget.reset();
      }}
    >
      <Card className="aspect-square flex flex-col">
        <CardHeader className="flex-row flex justify-between items-center gap-2">
          <Input
            required
            className="text-2xl text-center"
            placeholder="New Sound"
            type="text"
            name="name"
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </CardHeader>
        <CardContent className="flex flex-col flex-1 justify-between">
          <AudioUploader onChange={(f) => setFile(f)} allowDeletion />
          <Button
            className="mt-auto"
            disabled={!isComplete || soundAdd.isLoading}
            type="submit"
          >
            {soundAdd.isLoading ? (
              <ReloadIcon className="animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </CardContent>
      </Card>
      <CardFooter>
        {soundAdd.error ? (
          <p className="text-red-500">Unexpected error creating sound.</p>
        ) : null}
      </CardFooter>
    </form>
  );
}

function SoundFormMutation(initial: Sound) {
  const soundUpdate = useMutation({
    mutationFn: async (s: Partial<Sound>) => {
      const res = await fetch(`/api/sound`, {
        method: "PUT",
        body: JSON.stringify({ id: initial.id, ...s }),
      });
      if (!res.ok) throw new Error("Unexpected error updating sound.");
      return res;
    },
  });

  const debouncedName = useDebouncedCallback((name: string) => {
    soundUpdate.mutate({ name });
  }, 300);

  return (
    // `preventDefault`: Using `onChange` and
    // uploadthing callbacks to drive submissions
    <form onSubmit={(e) => e.preventDefault()}>
      <Card
        className="aspect-square"
        style={{ viewTransitionName: "sound-" + initial.id }}
      >
        <CardHeader className="relative flex-row flex justify-between items-center gap-2">
          <Input
            className="text-2xl text-center"
            style={{ viewTransitionName: "sound-name-" + initial.id }}
            type="text"
            name="name"
            onFocus={(e) => e.target.select()}
            defaultValue={initial.name}
            onChange={(e) => debouncedName(e.target.value)}
          />
          {!soundUpdate.isIdle ? (
            <p
              aria-live="polite"
              className={cn([
                "absolute top-[-4px] right-[-4px] text-xs flex justify-center items-center w-5 h-5 !m-0 rounded-full transition-colors duration-300",
                soundUpdate.isSuccess && "bg-green-100 text-green-950",
                soundUpdate.isError && "bg-red-100 text-red-950",
                soundUpdate.isLoading && "bg-yellow-100 text-yellow-950",
              ])}
            >
              {soundUpdate.isSuccess && (
                <>
                  <CheckIcon />
                  <span className="sr-only">Updated</span>
                </>
              )}
              {soundUpdate.isLoading && (
                <>
                  <ReloadIcon className="animate-spin" />
                  <span className="sr-only">Loading</span>
                </>
              )}
              {soundUpdate.isError && (
                <>
                  <Cross2Icon />
                  <span className="sr-only">Error</span>
                </>
              )}
            </p>
          ) : null}
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
