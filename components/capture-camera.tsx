"use client";

import { Camera, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CaptureCamera({
  instruction,
  onCapture,
  existingImage,
}: {
  instruction: string;
  onCapture: (image: string) => void;
  existingImage: string | null;
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
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {preview ? (
          <Image src={preview} alt="Captured" fill className="object-cover" unoptimized />
        ) : (
          <video ref={videoRef} className="h-[420px] w-full object-cover" playsInline muted autoPlay />
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
