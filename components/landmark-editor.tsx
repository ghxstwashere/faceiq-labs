"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildFallbackSideLandmarks, buildFrontLandmarks, buildSideLandmarks } from "@/lib/landmarks";
import { detectLandmarks, loadFaceApiModels } from "@/lib/face-api";
import type { LandmarkPoint } from "@/lib/store";

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

  const pointRadius = 7;

  const imageRatio = useMemo(() => {
    if (!imageEl) return 1;
    return imageEl.width / imageEl.height;
  }, [imageEl]);

  useEffect(() => {
    setPoints(saved);
  }, [saved]);

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

        const result = await detectLandmarks(img);
        if (!result?.landmarks) throw new Error("No face detected");
        const positions = (result.landmarks as { positions: Array<{ x: number; y: number }> }).positions;

        const mapped =
          mode === "front"
            ? buildFrontLandmarks(positions)
            : buildSideLandmarks(positions);

        if (!mounted) return;
        setPoints(mapped);
        onChange(mapped);
      } catch {
        if (!mounted) return;
        const img = await loadImage(image);
        setImageEl(img);
        if (mode === "side") {
          const fallback = buildFallbackSideLandmarks(img.width, img.height);
          setPoints(fallback);
          onChange(fallback);
          setError("Side profile auto-detect failed. Loaded fallback points so you can drag and continue.");
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

      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0a0a0a";
      ctx.font = "11px sans-serif";
      ctx.fillText(point.label, x - 3, y + 4);
    });
  }, [points, imageEl, imageRatio]);

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
      return dist(px, py, coords.x, coords.y) <= pointRadius + 6;
    });

    if (hit) {
      setDragging(hit.key);
      canvas.setPointerCapture(evt.pointerId);
    }
  };

  const onPointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !imageEl || !canvasRef.current) return;
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

  const reset = async () => {
    setLoading(true);
    setError(null);
    try {
      const img = await loadImage(image);
      setImageEl(img);
      const result = await detectLandmarks(img);
      if (!result?.landmarks) throw new Error("No face");
      const positions = (result.landmarks as { positions: Array<{ x: number; y: number }> }).positions;
      const mapped = mode === "front" ? buildFrontLandmarks(positions) : buildSideLandmarks(positions);
      setPoints(mapped);
      onChange(mapped);
    } catch {
      if (!imageEl) {
        setError("Auto-detect failed. Retake if the model keeps choking.");
        return;
      }
      if (mode === "side") {
        const fallback = buildFallbackSideLandmarks(imageEl.width, imageEl.height);
        setPoints(fallback);
        onChange(fallback);
        setError("Auto-detect failed again. Fallback side landmarks loaded; adjust and continue.");
      } else {
        setError("Auto-detect failed. Retake if the model keeps choking.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-cyan-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Running landmark detection...
        </div>
      )}
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
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
