import { cn } from "@/lib/utils";

export function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition",
        active ? "bg-cyan-500 text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:text-zinc-100",
      )}
    >
      {label}
    </button>
  );
}
