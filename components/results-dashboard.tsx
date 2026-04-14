"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AnalysisSummary } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ResultsDashboard({ analysis }: { analysis: AnalysisSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreCard label="Face IQ" value={analysis.overall} />
        <ScoreCard label="Angularity" value={analysis.angularity} />
        <ScoreCard label="Dimorphism" value={analysis.dimorphism} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {analysis.metrics.map((item) => (
          <Card key={item.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">{item.label}</p>
              <span className={cn("rounded-full px-3 py-1 text-xs font-bold", item.score < 4 ? "bg-rose-500/20 text-rose-300" : item.score < 7 ? "bg-orange-500/20 text-orange-300" : "bg-emerald-500/20 text-emerald-300")}>{item.score}/10</span>
            </div>
            <p className="text-sm text-zinc-400">
              Value: <span className="text-zinc-200">{item.value}{item.unit}</span> | Typical: <span className="text-zinc-200">{item.average}</span>
            </p>
            <p className="text-sm text-zinc-300">{item.message}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <div className={cn("mt-3 text-4xl font-bold", value < 4 ? "text-rose-400" : value < 7 ? "text-orange-300" : "text-emerald-300")}>{value.toFixed(1)}</div>
      {value < 4 && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-rose-300">
          <AlertTriangle className="h-3 w-3" /> severe weakness
        </div>
      )}
    </Card>
  );
}
