"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFaceIqStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const gender = useFaceIqStore((s) => s.gender);
  const setGender = useFaceIqStore((s) => s.setGender);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between py-3">
        <div className="font-semibold tracking-tight text-zinc-900">FaceIQ Labs</div>
        <nav className="hidden items-center gap-7 text-sm text-zinc-500 md:flex">
          <span>How it works</span>
          <span>Features</span>
          <span>Results</span>
          <span>Celebs</span>
          <span>Creator League</span>
          <Link href="/about" className="hover:text-zinc-900">About</Link>
        </nav>
        <Button className="px-6">Try Free</Button>
      </header>

      <section className="mx-auto mt-16 w-full max-w-4xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">350,000+ users • 400,000+ analyses</p>
        <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-7xl">
          Your Looks.
          <br />
          Measured. Tracked. Improved.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
          Analyze your face across 100+ metrics, get direct feedback, and track your progress over time.
        </p>
      </section>

      <Card className="mx-auto mt-10 w-full max-w-xl space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <Sparkles className="h-4 w-4" /> Select Baseline
        </div>
        <p className="text-sm text-zinc-500">Gender is required because dimorphism and averages are benchmarked differently.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender("male")}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-semibold transition",
              gender === "male" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500",
            )}
          >
            Male
          </button>
          <button
            onClick={() => setGender("female")}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-semibold transition",
              gender === "female" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500",
            )}
          >
            Female
          </button>
        </div>
        <Button className="w-full" disabled={!gender} onClick={() => router.push("/capture")}>Start Your Journey <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
    </main>
  );
}
