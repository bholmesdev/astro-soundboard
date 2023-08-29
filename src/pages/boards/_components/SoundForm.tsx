import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { zfd } from "zod-form-data";
import { z } from "zod";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "@/lib/debounce";
import type { Sound } from "@/lib/schema";

const queryClient = new QueryClient();

type SoundFormProps = Pick<typeof Sound.$inferSelect, "id" | "url">;

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
    mutationFn: async () => {
      const res = await fetch(`/api/sounds/new`, {
        method: "POST",
        body: JSON.stringify({ boardId }),
      });
      const data = await res.json();
      // surely type safety isn't important right?
      setSounds((prev) => [...prev, data]);
    },
  });

  return (
    <>
      {sounds.map((s) => (
        <SoundFormMutation key={s.id} {...s} />
      ))}
      <Button onClick={() => soundAdd.mutate()}>Add</Button>
    </>
  );
}

const soundFormValidator = zfd.formData({
  name: zfd.text(z.string().nonempty()),
  url: zfd.text(z.string().url()),
});

function SoundFormMutation({ id, url }: SoundFormProps) {
  const soundUpdate = useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch(`/api/sounds/${id}`, {
        method: "PUT",
        body: formData,
      });
    },
  });
  // TODO: standardized check for incomplete sound entry
  const isComplete = url || soundUpdate.status === "success";

  const debounced = useDebouncedCallback((formData: FormData) => {
    const parsed = soundFormValidator.safeParse(formData);
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
          <Input className="text-2xl" type="text" name="name" />
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
          <Input type="url" name="url" defaultValue={url ?? ""} />
        </CardContent>
      </Card>
    </form>
  );
}
