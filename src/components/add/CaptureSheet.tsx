import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { parseCapture } from "@/lib/kitchen/parser";
import { useKitchen } from "@/lib/kitchen/store";
import type { CaptureKind } from "@/lib/kitchen/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const KIND_COPY: Record<CaptureKind, { title: string; body: string; cta: string; needsText: boolean }> = {
  receipt_photo: {
    title: "Snap your receipt",
    body: "Hold steady — we'll pull out items, quantities, and where each one belongs.",
    cta: "Use sample receipt",
    needsText: false,
  },
  fridge_photo: {
    title: "Fridge photo",
    body: "Open the fridge and take one wide shot. We'll fill in the rest.",
    cta: "Use sample fridge",
    needsText: false,
  },
  grocery_photo: {
    title: "Grocery haul",
    body: "Lay the bags on the counter. One photo is enough.",
    cta: "Use sample haul",
    needsText: false,
  },
  voice: {
    title: "Talk it through",
    body: "Say what you bought, one thing per breath.",
    cta: "Process",
    needsText: true,
  },
  pasted_text: {
    title: "Paste receipt text",
    body: "From a grocery email or app — paste the raw text below.",
    cta: "Parse",
    needsText: true,
  },
  manual: {
    title: "Add manually",
    body: "One item per line: '2 lb chicken', 'milk', 'spinach x2'.",
    cta: "Add",
    needsText: true,
  },
};

export function CaptureSheet({ kind, onClose }: { kind: CaptureKind; onClose: () => void }) {
  const copy = KIND_COPY[kind];
  const stage = useKitchen((s) => s.stageCapture);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoTimer, setAutoTimer] = useState(false);

  useEffect(() => {
    if (!copy.needsText) setAutoTimer(true);
  }, [copy.needsText]);

  async function run() {
    setBusy(true);
    // Light simulated latency so the user feels the work happening.
    await new Promise((r) => setTimeout(r, copy.needsText ? 300 : 900));
    const items = parseCapture({ kind, text });
    stage(items);
    setBusy(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="w-full max-w-md rounded-t-3xl bg-card p-5 sm:rounded-3xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">{copy.title}</h2>
            <p className="text-sm text-muted-foreground">{copy.body}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!copy.needsText && (
          <div className="mb-4 flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Reading…
              </span>
            ) : (
              <span>Camera placeholder — we'll use a curated sample</span>
            )}
          </div>
        )}

        {copy.needsText && (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              kind === "voice"
                ? "e.g. one pound chicken, bag of spinach, a dozen eggs"
                : "1 gal milk\n2 lb chicken thighs\nspinach"
            }
            className="mb-4 min-h-32 rounded-2xl"
          />
        )}

        <Button
          onClick={run}
          disabled={busy || (copy.needsText && !text.trim())}
          className="h-12 w-full rounded-full text-base font-semibold"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.cta}
        </Button>

        {autoTimer && null}
      </motion.div>
    </div>
  );
}
