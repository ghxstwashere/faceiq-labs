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

  const pointRadius = 7;

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
    ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);

    points.forEach((point) => {
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

      ctx.fillStyle = "#0a0a0a";
      ctx.font = "11px sans-serif";
      ctx.fillText(point.label, x - 3, y + 4);
    });
  }, [points, imageEl, imageRatio, activeKey]);

  const eventToCanvasPoint = (evt: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const onPointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imageEl) return;
    const coords = eventToCanvasPoint(evt);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const hit = points.find((p) => {
      const px = (p.x / imageEl.width) * canvas.width;
      const py = (p.y / imageEl.height) * canvas.height;
      return dist(px, py, coords.x, coords.y) <= pointRadius + 8;
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
    const next = points.map((p) => {
      if (p.key !== dragging) return p;
      return {
        ...p,
        x: (coords.x / canvas.width) * imageEl.width,
        y: (coords.y / canvas.height) * imageEl.height,
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

  const activePoint = points.find((p) => p.key === activeKey) ?? null;

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-sky-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Running landmark detection...
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Point selection</p>
          <div className="mt-2 max-h-64 space-y-1 overflow-auto pr-1">
            {points.map((point) => (
              <button
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
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(0, -2)}>Up</Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(0, 2)}>Down</Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(-2, 0)}>Left</Button>
                <Button variant="outline" className="h-8 px-0" onClick={() => nudge(2, 0)}>Right</Button>
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
