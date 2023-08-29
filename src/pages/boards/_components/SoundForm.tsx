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

type SoundFormProps = {
  id: string;
  url: string;
};

type SoundsFormProps = {
  initialSounds: (typeof Sound.$inferSelect)[];
};

export function Sounds(props: SoundsFormProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SoundsMutation {...props} />
    </QueryClientProvider>
  );
}

function SoundsMutation({ initialSounds }: SoundsFormProps) {
  const [sounds, setSounds] = useState(initialSounds);

  const soundAdd = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sounds/new`, {
        method: "POST",
      });
      const data = await res.json();
      // surely type safety isn't important right?
      setSounds((prev) => [...prev, data]);
    },
  });

  return (
    <>
      {sounds.map((s) => (
        <SoundFormMutation key={s.id} id={s.id} url={s.url ?? ""} />
      ))}
      <Button onClick={() => soundAdd.mutate()}>Add</Button>
    </>
  );
}

const soundFormValidator = zfd.formData({
  name: zfd.text(z.string().nonempty()),
  url: zfd.text(z.string().url()),
});

function SoundFormMutation({ id: soundId, url }: SoundFormProps) {
  const soundUpdate = useMutation({
    mutationFn: (formData: FormData) => {
      console.log("soundId", soundId);
      return fetch(`/api/sounds/${soundId}`, {
        method: "PUT",
        body: formData,
      });
    },
  });
  const debounced = useDebouncedCallback((formData: FormData) => {
    const parsed = soundFormValidator.safeParse(formData);
    if (parsed.success) {
      soundUpdate.mutate(formData);
    }
    // TODO: error handling for debounced input?
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
        <CardHeader>
          <Input className="text-2xl" type="text" name="name" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input type="url" name="url" defaultValue={url} />
        </CardContent>
      </Card>
    </form>
  );
}
