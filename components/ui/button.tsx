import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-zinc-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] hover:bg-zinc-800",
        variant === "outline" && "border border-white/60 bg-white/70 text-zinc-700 backdrop-blur-xl hover:border-zinc-400 hover:text-zinc-900",
        variant === "danger" && "bg-rose-600 text-rose-50 hover:bg-rose-500",
        className,
      )}
      {...props}
    />
  );
}
