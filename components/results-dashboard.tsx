"use client";

import { AlertTriangle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { AnalysisSummary, MetricResult } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ResultsDashboard({ analysis }: { analysis: AnalysisSummary }) {
  const [activeMetric, setActiveMetric] = useState<MetricResult | null>(null);

  return (
    <>
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
            <h2 className="text-xl font-semibold text-zinc-900">Your Ratios</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Tap metric</span>
          </div>
          <div className="space-y-3">
            {analysis.metrics.map((item) => (
              <MetricRow
                key={item.key}
                label={item.label}
                score={item.score}
                detail={`${item.value}${item.unit} • Avg ${item.average}`}
                onClick={() => setActiveMetric(item)}
              />
            ))}
          </div>
        </Card>
      </div>

      {activeMetric && <MetricExplainer metric={activeMetric} onClose={() => setActiveMetric(null)} />}
    </>
  );
}

function MetricRow({
  label,
  score,
  detail,
  onClick,
}: {
  label: string;
  score: number;
  detail: string;
  onClick: () => void;
}) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));

  return (
    <button onClick={onClick} className="w-full space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-left transition hover:border-zinc-400">
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
    </button>
  );
}

function MetricExplainer({ metric, onClose }: { metric: MetricResult; onClose: () => void }) {
  const title = useMemo(() => `${metric.label} Visual`, [metric.label]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/40 bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Metric explainer</p>
            <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-zinc-300 p-2 text-zinc-600 hover:text-zinc-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <MetricGraphic metricKey={metric.key} />
          </div>
          <div className="space-y-2 text-sm text-zinc-600">
            <p><span className="font-semibold text-zinc-900">Current:</span> {metric.value}{metric.unit}</p>
            <p><span className="font-semibold text-zinc-900">Average:</span> {metric.average}</p>
            <p><span className="font-semibold text-zinc-900">Score:</span> {metric.score}/10</p>
            <p className="rounded-lg bg-zinc-100 p-2 text-xs">{metric.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricGraphic({ metricKey }: { metricKey: string }) {
  if (metricKey === "canthal") {
    return (
      <svg viewBox="0 0 320 180" className="h-56 w-full">
        <line x1="60" y1="110" x2="260" y2="110" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="85" y1="120" x2="145" y2="90" stroke="#0ea5e9" strokeWidth="4" />
        <line x1="175" y1="95" x2="235" y2="125" stroke="#0ea5e9" strokeWidth="4" />
        <circle cx="85" cy="120" r="5" fill="#f59e0b" />
        <circle cx="145" cy="90" r="5" fill="#f59e0b" />
        <text x="154" y="86" fontSize="12" fill="#334155">canthal tilt</text>
      </svg>
    );
  }

  if (metricKey === "gonialAngle") {
    return (
      <svg viewBox="0 0 320 180" className="h-56 w-full">
        <polyline points="80,60 145,120 245,92" fill="none" stroke="#0ea5e9" strokeWidth="4" />
        <circle cx="145" cy="120" r="5" fill="#f59e0b" />
        <path d="M145 108 A22 22 0 0 1 163 114" stroke="#ef4444" strokeWidth="3" fill="none" />
        <text x="170" y="114" fontSize="12" fill="#334155">gonial angle</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 180" className="h-56 w-full">
      <rect x="30" y="30" width="260" height="120" rx="12" fill="#e2e8f0" />
      <line x1="60" y1="125" x2="260" y2="55" stroke="#0ea5e9" strokeWidth="4" />
      <circle cx="60" cy="125" r="5" fill="#f59e0b" />
      <circle cx="260" cy="55" r="5" fill="#f59e0b" />
      <text x="70" y="145" fontSize="12" fill="#334155">landmark A</text>
      <text x="230" y="47" fontSize="12" fill="#334155">landmark B</text>
    </svg>
  );
}
