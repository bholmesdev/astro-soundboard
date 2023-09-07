import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/lib/debounce";
import type { Board } from "@/lib/schema";
import { QueryContext } from "@/lib/tanstack";
import { cn } from "@/lib/utils";
import { CheckIcon, ReloadIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";

export function BoardNameInput({
  board,
}: {
  board: typeof Board.$inferSelect;
}) {
  const setBoardName = useMutation(
    async (name: string) => {
      const res = await fetch("/api/board", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: board.id, name }),
      });
      if (!res.ok) {
        throw new Error("Failed to update board name");
      }
    },
    { context: QueryContext }
  );

  const debouncedName = useDebouncedCallback((name: string) => {
    setBoardName.mutate(name);
  }, 300);

  return (
    <div className="relative flex-1">
      <Input
        name="board-name"
        className="text-2xl"
        onChange={(e) => {
          const name = e.target.value;
          if (!name.length) return;
          debouncedName(e.target.value);
        }}
        defaultValue={board.name}
      />
      {!setBoardName.isIdle ? (
        <p
          aria-live="polite"
          className={cn([
            "absolute top-[-10px] left-[-10px] text-xs flex justify-center items-center w-5 h-5 !m-0 rounded-full transition-colors duration-300",
            setBoardName.isSuccess && "bg-green-100 text-green-950",
            setBoardName.isError && "bg-red-100 text-red-950",
            setBoardName.isLoading && "bg-yellow-100 text-yellow-950",
          ])}
        >
          {setBoardName.isSuccess && (
            <>
              <CheckIcon />
              <span className="sr-only">Updated</span>
            </>
          )}
          {setBoardName.isLoading && (
            <>
              <ReloadIcon className="animate-spin" />
              <span className="sr-only">Loading</span>
            </>
          )}
          {setBoardName.isError && (
            <>
              <Cross2Icon />
              <span className="sr-only">Error</span>
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
