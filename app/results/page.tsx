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
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Analysis</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Facial Metrics Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">No sugarcoating. Raw scores against benchmark averages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { resetLandmarks(); router.push("/landmarks"); }}>Edit Landmarks</Button>
          <Button variant="danger" onClick={() => { resetAll(); router.push("/capture"); }}>Retake Photos</Button>
        </div>
      </header>

      <ResultsDashboard analysis={analysis} />
    </main>
  );
}
