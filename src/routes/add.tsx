import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CaptureGrid } from "@/components/add/CaptureGrid";
import { CaptureSheet } from "@/components/add/CaptureSheet";
import { ReviewBatch } from "@/components/add/ReviewBatch";
import type { CaptureKind } from "@/lib/kitchen/types";

export const Route = createFileRoute("/add")({
  ssr: false,
  component: AddPage,
});

function AddPage() {
  const [kind, setKind] = useState<CaptureKind | null>(null);

  return (
    <div className="min-h-[100dvh] pb-24">
      <header className="px-4 pb-2 pt-4">
        <h1 className="font-display text-2xl font-semibold">Capture</h1>
        <p className="text-sm text-muted-foreground">
          Pick the fastest way to tell us what you have. We'll keep the kitchen honest.
        </p>
      </header>
      <main className="space-y-4 px-4">
        <ReviewBatch />
        <CaptureGrid onPick={setKind} />
      </main>
      {kind && <CaptureSheet kind={kind} onClose={() => setKind(null)} />}
    </div>
  );
}
