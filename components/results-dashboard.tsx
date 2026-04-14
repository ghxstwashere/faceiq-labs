"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AnalysisSummary } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ResultsDashboard({ analysis }: { analysis: AnalysisSummary }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <Card className="overflow-hidden p-0">
        <div className="flex h-full min-h-[420px] items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-700 p-8 text-white">
          <div className="max-w-xs text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">Face IQ</p>
            <p className="mt-4 text-7xl font-semibold tracking-tight">{analysis.overall.toFixed(1)}</p>
            <p className="mt-3 text-sm text-zinc-300">Direct aggregate across frontal and profile geometry.</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">Your Side Ratios</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort</span>
        </div>
        <div className="space-y-3">
          {analysis.metrics.map((item) => (
            <MetricRow key={item.key} label={item.label} score={item.score} detail={`${item.value}${item.unit} • Avg ${item.average}`} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricRow({ label, score, detail }: { label: string; score: number; detail: string }) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));

  return (
    <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-zinc-700">{label}</p>
        <p className={cn("font-semibold", score < 4 ? "text-rose-600" : score < 7 ? "text-amber-600" : "text-emerald-600")}>{score.toFixed(1)}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className={cn("h-full rounded-full", score < 4 ? "bg-rose-500" : score < 7 ? "bg-amber-500" : "bg-emerald-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500">{detail}</p>
      {score < 4 && (
        <div className="flex items-center gap-1 text-xs text-rose-600">
          <AlertTriangle className="h-3 w-3" /> major weakness
        </div>
      )}
    </div>
  );
}
