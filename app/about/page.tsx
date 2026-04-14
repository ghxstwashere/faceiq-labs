import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-4 py-8 sm:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">About</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Why FaceIq Labs exists</h1>
      </div>

      <Card className="space-y-3 text-sm text-zinc-300">
        <p>
          FaceIq Labs estimates angularity and sexual dimorphism from landmark geometry. We use facial ratios and profile angles that are common in anthropometric literature, then compare you against population-level averages.
        </p>
        <p>
          This is not medical advice, diagnosis, or a beauty guarantee. It is a geometric scoring model with intentionally blunt language.
        </p>
        <p>
          Landmark quality controls everything. Bad lighting, lens distortion, and sloppy profile capture can corrupt scores.
        </p>
      </Card>

      <Link href="/" className="text-cyan-300 hover:text-cyan-200">Back to analyzer</Link>
    </main>
  );
}
