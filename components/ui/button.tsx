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
        variant === "primary" && "bg-zinc-950 text-white hover:bg-zinc-800",
        variant === "outline" && "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-950",
        variant === "danger" && "bg-rose-600 text-rose-50 hover:bg-rose-500",
        className,
      )}
      {...props}
    />
  );
}
