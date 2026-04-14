"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Microscope, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFaceIqStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const gender = useFaceIqStore((s) => s.gender);
  const setGender = useFaceIqStore((s) => s.setGender);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-8">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2 text-zinc-100">
          <Microscope className="h-5 w-5 text-cyan-400" />
          <span className="font-semibold tracking-wide">FaceIq Labs</span>
        </div>
        <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-100">About</Link>
      </header>

      <section className="mx-auto mt-10 w-full max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">350k+ users • 400k+ analyses</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-zinc-50 sm:text-7xl">FaceIq Labs</h1>
        <p className="mt-4 text-lg text-zinc-300">Brutally honest facial metrics • Angularity & Dimorphism</p>
      </section>

      <Card className="mx-auto mt-10 w-full max-w-xl space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <Skull className="h-5 w-5 text-rose-400" /> Choose baseline
        </h2>
        <p className="text-sm text-zinc-400">Gender selection is mandatory because averages and dimorphism scoring differ.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setGender("male")} className={cn("rounded-xl border px-4 py-3 text-sm font-semibold transition", gender === "male" ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500")}>Male</button>
          <button onClick={() => setGender("female")} className={cn("rounded-xl border px-4 py-3 text-sm font-semibold transition", gender === "female" ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500")}>Female</button>
        </div>
        <Button className="w-full" disabled={!gender} onClick={() => router.push("/capture")}>Start Analysis</Button>
      </Card>
    </main>
  );
}
