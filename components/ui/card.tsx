import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)]", className)}
      {...props}
    />
  );
}
