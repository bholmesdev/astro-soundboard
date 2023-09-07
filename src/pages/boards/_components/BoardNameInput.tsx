import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/lib/debounce";
import type { Board } from "@/lib/schema";
import { QueryContext } from "@/lib/tanstack";
import { useMutation } from "@tanstack/react-query";

export function BoardNameInput({
  board,
}: {
  board: typeof Board.$inferSelect;
}) {
  const setBoardName = useMutation(
    (name: string) => {
      return fetch("/api/board", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: board.id, name }),
      });
    },
    { context: QueryContext }
  );

  const debouncedName = useDebouncedCallback((name: string) => {
    setBoardName.mutate(name);
  }, 300);

  return (
    <Input
      name="board-name"
      onChange={(e) => debouncedName(e.target.value)}
      defaultValue={board.name}
    />
  );
}
