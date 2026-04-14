"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { LandmarkEditor } from "@/components/landmark-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { TabButton } from "@/components/ui/tab-button";
import { runAnalysis } from "@/lib/analysis";
import { useFaceIqStore } from "@/lib/store";

export default function LandmarkPage() {
  const router = useRouter();
  const gender = useFaceIqStore((s) => s.gender);
  const frontPhoto = useFaceIqStore((s) => s.frontPhoto);
  const sidePhoto = useFaceIqStore((s) => s.sidePhoto);
  const frontLandmarks = useFaceIqStore((s) => s.frontLandmarks);
  const sideLandmarks = useFaceIqStore((s) => s.sideLandmarks);
  const frontConfirmed = useFaceIqStore((s) => s.frontConfirmed);
  const sideConfirmed = useFaceIqStore((s) => s.sideConfirmed);
  const setLandmarks = useFaceIqStore((s) => s.setLandmarks);
  const setConfirmed = useFaceIqStore((s) => s.setConfirmed);
  const setAnalysis = useFaceIqStore((s) => s.setAnalysis);
  const [tab, setTab] = useState<"front" | "side">("front");

  useEffect(() => {
    if (!gender || !frontPhoto || !sidePhoto) router.replace("/capture");
  }, [gender, frontPhoto, sidePhoto, router]);

  const progress = useMemo(() => {
    if (frontConfirmed && sideConfirmed) return 100;
    if (frontConfirmed || sideConfirmed) return 70;
    return 40;
  }, [frontConfirmed, sideConfirmed]);

  const submit = () => {
    if (!gender || frontLandmarks.length === 0 || sideLandmarks.length === 0) return;
    const analysis = runAnalysis(frontLandmarks, sideLandmarks, gender);
    setAnalysis(analysis);
    router.push("/results");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Landmark editing</p>
        <ProgressBar value={progress} />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <TabButton active={tab === "front"} label="Front Photo" onClick={() => setTab("front")} />
            <TabButton active={tab === "side"} label="Side Photo" onClick={() => setTab("side")} />
          </div>
          <div className="text-xs text-zinc-400">Drag dots to correct bad placements.</div>
        </div>

        {tab === "front" && frontPhoto && (
          <LandmarkEditor
            image={frontPhoto}
            mode="front"
            saved={frontLandmarks}
            onChange={(pts) => setLandmarks("front", pts)}
            onConfirm={() => setConfirmed("front", true)}
          />
        )}

        {tab === "side" && sidePhoto && (
          <LandmarkEditor
            image={sidePhoto}
            mode="side"
            saved={sideLandmarks}
            onChange={(pts) => setLandmarks("side", pts)}
            onConfirm={() => setConfirmed("side", true)}
          />
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push("/capture")}>Retake Photos</Button>
        <Button onClick={submit} disabled={!frontConfirmed || !sideConfirmed}>
          <FlaskConical className="mr-2 h-4 w-4" /> Run Brutal Analysis
        </Button>
      </div>
    </main>
  );
}
