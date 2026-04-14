"use client";

import { Camera, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CaptureCamera({
  instruction,
  onCapture,
  existingImage,
  mode,
}: {
  instruction: string;
  onCapture: (image: string) => void;
  existingImage: string | null;
  mode: "front" | "side";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    async function boot() {
      if (preview) return;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch {
        setError("Camera access failed. Allow permission and refresh.");
      }
    }

    void boot();

    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, [preview]);

  const capture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.95);
    setPreview(data);
    setStreaming(false);
    onCapture(data);

    const stream = videoRef.current.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-300">{instruction}</p>
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/45 bg-white/60 backdrop-blur-xl">
        {preview ? (
          <Image src={preview} alt="Captured" fill className="object-cover" unoptimized />
        ) : (
          <video ref={videoRef} className="h-[420px] w-full object-cover" playsInline muted autoPlay />
        )}
        {!preview && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-4 rounded-[1.25rem] border border-white/55" />
            {mode === "front" ? (
              <>
                <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-white/35" />
                <div className="absolute top-1/2 left-4 right-4 h-px -translate-y-1/2 bg-white/25" />
              </>
            ) : (
              <div className="absolute right-[26%] top-[18%] h-[64%] w-[32%] rounded-[45%_40%_40%_45%] border border-dashed border-white/55" />
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3">
        {!preview && (
          <Button onClick={capture} disabled={!streaming}>
            <Camera className="mr-2 h-4 w-4" /> Capture
          </Button>
        )}
        {preview && (
          <Button
            variant="outline"
            onClick={() => {
              setPreview(null);
              setError(null);
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Retake
          </Button>
        )}
      </div>
    </div>
  );
}
