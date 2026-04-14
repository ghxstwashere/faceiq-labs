import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-cyan-500 text-zinc-950 hover:bg-cyan-400",
        variant === "outline" && "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-cyan-500 hover:text-cyan-300",
        variant === "danger" && "bg-rose-600 text-rose-50 hover:bg-rose-500",
        className,
      )}
      {...props}
    />
  );
}
