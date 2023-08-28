import { Button } from "@/components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import type { Sound } from "@/lib/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function NewBoardForm() {
  const [sounds, setSounds] = useState<Map<string, string>>(new Map());

  function addSound(url: string) {
    setSounds((sounds) => {
      const id = `${sounds.size}`;
      sounds.set(id, url);
      return new Map(sounds);
    });
  }

  function updateSound(id: string, url: string) {
    setSounds((sounds) => {
      if (!sounds.has(id)) {
        throw new Error(`Sound with id ${id} does not exist.`);
      }
      sounds.set(id, url);
      return new Map(sounds);
    });
  }

  return (
    <>
      <Button
        onClick={async () => {
          const res = await fetch("/api/boards/new", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(sounds.entries())),
            headers: { "Content-Type": "application/json" },
          });
          // TODO: error banner
          if (res.status !== 200) return;

          const { boardId } = await res.json();
          window.location.pathname = `/boards/${boardId}`;
        }}
      >
        Create board 🎉
      </Button>
      <div className="grid grid-cols-3 gap-3">
        {[...sounds.entries()].map(([id, url]) => (
          <FormCard
            key={id}
            onSubmit={async (e) => {
              e.preventDefault();
              // @ts-expect-error They should've fixed form types 3 years ago
              const formData = new FormData(e.target);

              const updatedUrl = formData.get("url");
              if (typeof updatedUrl !== "string") return;

              updateSound(id, updatedUrl);
            }}
          >
            <Input name="url" defaultValue={url} />
            <Button variant="secondary">Update</Button>
          </FormCard>
        ))}
        <FormCard
          onSubmit={async (e) => {
            e.preventDefault();
            // @ts-expect-error They should've fixed form types 3 years ago
            const formData = new FormData(e.target);

            const url = formData.get("url");
            if (typeof url !== "string") return;

            addSound(url);

            e.currentTarget.reset();
          }}
        >
          <Input type="url" name="url" />
          <Button>Add</Button>
        </FormCard>
      </div>
    </>
  );
}

interface FormCardProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

function FormCard({ children, ...props }: FormCardProps) {
  return (
    <form {...props}>
      <Card>
        <CardHeader>
          <h2>My sound</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">{children}</CardContent>
      </Card>
    </form>
  );
}
