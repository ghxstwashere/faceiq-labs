import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/45 bg-white/65 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.2)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
