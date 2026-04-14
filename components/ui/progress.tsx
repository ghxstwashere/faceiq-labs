import { cn } from "@/lib/utils";

export function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all")}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
