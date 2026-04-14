"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ResultsDashboard } from "@/components/results-dashboard";
import { useFaceIqStore } from "@/lib/store";

export default function ResultsPage() {
  const router = useRouter();
  const analysis = useFaceIqStore((s) => s.analysis);
  const resetLandmarks = useFaceIqStore((s) => s.resetLandmarks);
  const resetAll = useFaceIqStore((s) => s.resetAll);

  useEffect(() => {
    if (!analysis) router.replace("/landmarks");
  }, [analysis, router]);

  if (!analysis) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Results</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100 sm:text-4xl">Brutal facial report</h1>
        <p className="mt-2 text-sm text-zinc-400">No fluff. No cope. Just numbers and consequences.</p>
      </div>

      <ResultsDashboard analysis={analysis} />

      <div className="flex flex-wrap gap-3 pb-8">
        <Button variant="outline" onClick={() => { resetLandmarks(); router.push("/landmarks"); }}>Edit Landmarks Again</Button>
        <Button variant="danger" onClick={() => { resetAll(); router.push("/capture"); }}>Retake Photos</Button>
      </div>
    </main>
  );
}
