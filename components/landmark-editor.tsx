"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildFallbackSideLandmarks, buildFrontLandmarks, buildSideLandmarks } from "@/lib/landmarks";
import { detectLandmarks, loadFaceApiModels } from "@/lib/face-api";
import type { LandmarkPoint } from "@/lib/store";
import { cn } from "@/lib/utils";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed"));
    img.src = src;
  });
}

export function LandmarkEditor({
  image,
  mode,
  saved,
  onChange,
  onConfirm,
}: {
  image: string;
  mode: "front" | "side";
  saved: LandmarkPoint[];
  onChange: (points: LandmarkPoint[]) => void;
  onConfirm: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<LandmarkPoint[]>(saved);
  const [dragging, setDragging] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(saved[0]?.key ?? null);
  const [showAllPoints, setShowAllPoints] = useState(false);

  const [enhanceVisibility, setEnhanceVisibility] = useState(true);
  const [zoomToActive, setZoomToActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.8);
  const [nudgeStep, setNudgeStep] = useState(6);

  const pointRadius = 10;
  const hitRadius = 20;

  const imageRatio = useMemo(() => {
    if (!imageEl) return 1;
    return imageEl.width / imageEl.height;
  }, [imageEl]);

  useEffect(() => {
    setPoints(saved);
    if (saved.length > 0 && !saved.some((p) => p.key === activeKey)) {
      setActiveKey(saved[0].key);
    }
  }, [saved, activeKey]);

  useEffect(() => {
    let mounted = true;

    async function autoDetect() {
      if (saved.length > 0) return;
      setLoading(true);
      setError(null);

      try {
        await loadFaceApiModels();
        const img = await loadImage(image);
        if (!mounted) return;
        setImageEl(img);

        const result = await detectLandmarks(img, mode);
        if (!result?.landmarks) throw new Error("No face detected");
        const positions = (result.landmarks as { positions: Array<{ x: number; y: number }> }).positions;

        const mapped = mode === "front" ? buildFrontLandmarks(positions) : buildSideLandmarks(positions);

        if (!mounted) return;
        setPoints(mapped);
        setActiveKey(mapped[0]?.key ?? null);
        onChange(mapped);
      } catch {
        if (!mounted) return;
        const img = await loadImage(image);
        setImageEl(img);
        if (mode === "side") {
          const fallback = buildFallbackSideLandmarks(img.width, img.height);
          setPoints(fallback);
          setActiveKey(fallback[0]?.key ?? null);
          onChange(fallback);
          setError("Side profile auto-detect failed. Fallback points loaded; select each point and fine-tune.");
        } else {
          setError("No face detected. Retake this shot with cleaner angle and lighting.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void autoDetect();

    return () => {
      mounted = false;
    };
  }, [image, mode, onChange, saved.length]);

  const activePoint = points.find((p) => p.key === activeKey) ?? null;

  const view = useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return { scale: 1, tx: 0, ty: 0 };
    if (!zoomToActive || showAllPoints || !activePoint) return { scale: 1, tx: 0, ty: 0 };

    const scale = Math.max(1, Math.min(3, zoomLevel));
    const baseX = (activePoint.x / imageEl.width) * canvas.width;
    const baseY = (activePoint.y / imageEl.height) * canvas.height;
    const tx = canvas.width / 2 - baseX * scale;
    const ty = canvas.height / 2 - baseY * scale;
    return { scale, tx, ty };
  }, [activePoint, imageEl, showAllPoints, zoomLevel, zoomToActive]);

  useEffect(() => {
    void loadImage(image).then(setImageEl);
  }, [image]);

  useEffect(() => {
    if (!canvasRef.current || !imageEl) return;

    const canvas = canvasRef.current;
    const parentWidth = canvas.parentElement?.clientWidth ?? imageEl.width;
    canvas.width = parentWidth;
    canvas.height = parentWidth / imageRatio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.filter = enhanceVisibility ? "contrast(1.18) brightness(1.06) saturate(1.02)" : "none";
    ctx.setTransform(view.scale, 0, 0, view.scale, view.tx, view.ty);
    ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);

    const renderPoints = showAllPoints ? points : points.filter((p) => p.key === activeKey);
    renderPoints.forEach((point) => {
      const x = (point.x / imageEl.width) * canvas.width;
      const y = (point.y / imageEl.height) * canvas.height;
      const isActive = point.key === activeKey;

      ctx.fillStyle = isActive ? "#f59e0b" : "#22d3ee";
      ctx.beginPath();
      ctx.arc(x, y, isActive ? pointRadius + 1 : pointRadius, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, pointRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(point.label, x - 4, y + 5);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(point.label, x - 4, y + 5);
    });
    ctx.restore();
  }, [points, imageEl, imageRatio, activeKey, showAllPoints, enhanceVisibility, view]);

  const eventToCanvasPoint = (evt: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const canvasToScenePoint = (pt: { x: number; y: number }) => {
    return { x: (pt.x - view.tx) / view.scale, y: (pt.y - view.ty) / view.scale };
  };

  const onPointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imageEl) return;
    const coords = eventToCanvasPoint(evt);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = canvasToScenePoint(coords);
    const hitCandidates = showAllPoints ? points : points.filter((p) => p.key === activeKey);
    const hit = hitCandidates.find((p) => {
      const px = (p.x / imageEl.width) * canvas.width;
      const py = (p.y / imageEl.height) * canvas.height;
      return dist(px, py, scene.x, scene.y) <= hitRadius;
    });

    if (!hit) return;
    setActiveKey(hit.key);
    setDragging(hit.key);
    canvas.setPointerCapture(evt.pointerId);
  };

  const onPointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !imageEl || !canvasRef.current || dragging !== activeKey) return;
    const coords = eventToCanvasPoint(evt);
    if (!coords) return;

    const canvas = canvasRef.current;
    const scene = canvasToScenePoint(coords);
    const next = points.map((p) => {
      if (p.key !== dragging) return p;
      return {
        ...p,
        x: (scene.x / canvas.width) * imageEl.width,
        y: (scene.y / canvas.height) * imageEl.height,
      };
    });

    setPoints(next);
    onChange(next);
  };

  const onPointerUp = () => {
    setDragging(null);
  };

  const selectPoint = (key: string) => {
    setActiveKey(key);
  };

  const nudge = (dx: number, dy: number) => {
    if (!activeKey || !imageEl) return;
    const next = points.map((p) => {
      if (p.key !== activeKey) return p;
      return {
        ...p,
        x: Math.max(0, Math.min(imageEl.width, p.x + dx)),
        y: Math.max(0, Math.min(imageEl.height, p.y + dy)),
      };
    });
    setPoints(next);
    onChange(next);
  };

  useEffect(() => {
    const onKeyDown = (evt: KeyboardEvent) => {
      if (!activeKey) return;
      if (evt.key !== "ArrowUp" && evt.key !== "ArrowDown" && evt.key !== "ArrowLeft" && evt.key !== "ArrowRight") return;
      evt.preventDefault();
      const step = (evt.shiftKey ? 4 : 1) * nudgeStep;
      if (evt.key === "ArrowUp") nudge(0, -step);
      if (evt.key === "ArrowDown") nudge(0, step);
      if (evt.key === "ArrowLeft") nudge(-step, 0);
      if (evt.key === "ArrowRight") nudge(step, 0);
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeKey, nudgeStep, imageEl, points]);

  const reset = async () => {
    setLoading(true);
    setError(null);
    try {
      const img = await loadImage(image);
      setImageEl(img);
      const result = await detectLandmarks(img, mode);
      if (!result?.landmarks) throw new Error("No face");
      const positions = (result.landmarks as { positions: Array<{ x: number; y: number }> }).positions;
      const mapped = mode === "front" ? buildFrontLandmarks(positions) : buildSideLandmarks(positions);
      setPoints(mapped);
      setActiveKey(mapped[0]?.key ?? null);
      onChange(mapped);
    } catch {
      if (!imageEl || mode !== "side") {
        setError("Auto-detect failed. Retake if the model keeps choking.");
        return;
      }
      const fallback = buildFallbackSideLandmarks(imageEl.width, imageEl.height);
      setPoints(fallback);
      setActiveKey(fallback[0]?.key ?? null);
      onChange(fallback);
      setError("Auto-detect failed again. Fallback side landmarks loaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-sky-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Running landmark detection...
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/55 backdrop-blur-xl">
          <canvas
            ref={canvasRef}
            className="w-full touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

        <div className="rounded-2xl border border-white/40 bg-white/65 p-3 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Visibility & controls</p>
          <div className="mt-2 grid gap-2">
            <button
              type="button"
              onClick={() => setEnhanceVisibility((v) => !v)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400"
            >
              {enhanceVisibility ? "Disable enhance visibility" : "Enable enhance visibility"}
            </button>
            <button
              type="button"
              onClick={() => setZoomToActive((v) => !v)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400"
            >
              {zoomToActive ? "Disable zoom-to-active point" : "Enable zoom-to-active point"}
            </button>
            {!showAllPoints && zoomToActive && (
              <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Zoom</span>
                  <span className="tabular-nums text-zinc-500">{zoomLevel.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            )}
            <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">Nudge step</span>
                <span className="tabular-nums text-zinc-500">{nudgeStep}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={nudgeStep}
                onChange={(e) => setNudgeStep(Number(e.target.value))}
                className="mt-2 w-full"
              />
              <p className="mt-1 text-[11px] text-zinc-500">Arrow keys nudge. Hold Shift for 4× step.</p>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Point selection</p>
          <button
            type="button"
            onClick={() => setShowAllPoints((v) => !v)}
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400"
          >
            {showAllPoints ? "Hide other points (focus mode)" : "Show all points"}
          </button>
          <div className="mt-2 max-h-52 space-y-1 overflow-auto pr-1">
            {points.map((point) => (
              <button
                type="button"
                key={point.key}
                onClick={() => selectPoint(point.key)}
                className={cn(
                  "w-full rounded-lg border px-2.5 py-2 text-left text-xs transition",
                  point.key === activeKey
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400",
                )}
              >
                {point.label}. {point.name}
              </button>
            ))}
          </div>

          {activePoint && (
            <div className="mt-3 space-y-2 rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-800">Active: {activePoint.name}</p>
              <p>x: {Math.round(activePoint.x)} | y: {Math.round(activePoint.y)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(0, -nudgeStep)}>
                  Up
                </Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(0, nudgeStep)}>
                  Down
                </Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(-nudgeStep, 0)}>
                  Left
                </Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(nudgeStep, 0)}>
                  Right
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={reset} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset to Auto
        </Button>
        <Button onClick={onConfirm} disabled={points.length === 0 || loading}>
          Confirm Landmarks
        </Button>
      </div>
    </div>
  );
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}
