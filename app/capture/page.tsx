"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CaptureCamera } from "@/components/capture-camera";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useFaceIqStore } from "@/lib/store";

export default function CapturePage() {
  const router = useRouter();
  const gender = useFaceIqStore((s) => s.gender);
  const frontPhoto = useFaceIqStore((s) => s.frontPhoto);
  const sidePhoto = useFaceIqStore((s) => s.sidePhoto);
  const setPhoto = useFaceIqStore((s) => s.setPhoto);
  const [step, setStep] = useState<"front" | "side">("front");

  useEffect(() => {
    if (!gender) router.replace("/");
  }, [gender, router]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-6 px-4 py-8 sm:px-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Capture</p>
        <ProgressBar value={step === "front" ? 50 : 100} />
      </div>

      <div className="flex gap-2 text-sm">
        <span className={step === "front" ? "text-cyan-300" : "text-zinc-500"}>Front</span>
        <span className="text-zinc-600">•</span>
        <span className={step === "side" ? "text-cyan-300" : "text-zinc-500"}>Side</span>
      </div>

      <Card>
        {step === "front" ? (
          <CaptureCamera
            key="front-camera"
            instruction="Neutral expression, look straight at camera, even lighting"
            existingImage={frontPhoto}
            onCapture={(img) => setPhoto("front", img)}
          />
        ) : (
          <CaptureCamera
            key="side-camera"
            instruction="Perfect 90° profile, look straight ahead, relaxed"
            existingImage={sidePhoto}
            onCapture={(img) => setPhoto("side", img)}
          />
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        {step === "side" && (
          <Button variant="outline" onClick={() => setStep("front")}>Back to Front</Button>
        )}

        {step === "front" ? (
          <Button onClick={() => setStep("side")} disabled={!frontPhoto}>Next: Side Photo</Button>
        ) : (
          <Button onClick={() => router.push("/landmarks")} disabled={!frontPhoto || !sidePhoto}>
            Continue to Landmarks <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  );
}
