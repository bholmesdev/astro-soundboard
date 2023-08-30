import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "@/lib/debounce";
import {
  soundCompleteValidator,
  type Sound,
  soundValidator,
} from "@/lib/schema";
import { updateSoundValidator } from "@/pages/api/sounds/[soundId]";

const queryClient = new QueryClient();

type SoundsFormProps = {
  boardId: string;
  initialSounds: (typeof Sound.$inferSelect)[];
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
      const res = await fetch(`/api/sounds/new`, {
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

type SoundFormProps = Pick<typeof Sound.$inferSelect, "id" | "name" | "url">;

function SoundFormMutation(initial: SoundFormProps) {
  const soundUpdate = useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch(`/api/sounds/${initial.id}`, {
        method: "PUT",
        body: formData,
      });
    },
  });

  const isComplete =
    soundUpdate.isSuccess ||
    soundCompleteValidator.omit({ boardId: true }).safeParse(initial).success;

  const debounced = useDebouncedCallback((formData: FormData) => {
    const parsed = updateSoundValidator.safeParse(formData);
    if (parsed.success) {
      soundUpdate.mutate(formData);
    }
  }, 300);

  return (
    <form
      onChange={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget as HTMLFormElement);
        debounced(data);
      }}
    >
      <Card>
        <CardHeader className="flex-row flex justify-between items-center gap-2">
          <Input
            className="text-2xl"
            type="text"
            name="name"
            onFocus={(e) => e.target.select()}
            defaultValue={initial.name}
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
          <Input type="url" name="url" defaultValue={initial.url ?? ""} />
        </CardContent>
      </Card>
    </form>
  );
}
