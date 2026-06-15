import { motion } from "framer-motion";
import { Check, ChefHat, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useKitchen } from "@/lib/kitchen/store";
import type { Meal } from "@/lib/kitchen/types";
import { Button } from "@/components/ui/button";

interface Delta {
  itemId: string;
  name: string;
  before: number;
  after: number;
  unit: string;
}

export function CookSheet({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const markCooked = useKitchen((s) => s.markCooked);
  const applyConsumption = useKitchen((s) => s.applyConsumption);
  const [step, setStep] = useState<"recipe" | "confirm">("recipe");
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const subs = useMemo(() => {
    const ranked = useKitchen.getState().rankedDeck();
    return ranked.find((r) => r.meal.id === meal.id)?.substitutions ?? [];
  }, [meal.id]);

  function handleCooked() {
    const ds = markCooked(meal.id);
    setDeltas(ds);
    if (ds.length === 0) {
      toast.success("Nice — marked as cooked.");
      onClose();
      return;
    }
    setStep("confirm");
  }

  function confirmConsumption() {
    const final = deltas.filter((d) => !skipped.has(d.itemId));
    applyConsumption(final);
    toast.success(`Kitchen updated — ${final.length} item${final.length === 1 ? "" : "s"} adjusted.`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="font-display text-xl font-semibold leading-tight">{meal.title}</h2>
            <p className="text-xs text-muted-foreground">
              {meal.minutes} min · {meal.method.replace("-", " ")} · serves {meal.servings}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {step === "recipe" ? (
          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ingredients
              </h3>
              <ul className="space-y-1.5 text-sm">
                {meal.ingredients.map((i) => (
                  <li key={i.name} className="flex justify-between gap-3">
                    <span>{i.name}</span>
                    <span className="text-muted-foreground">
                      {i.qty} {i.unit}
                      {i.optional ? " · optional" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {subs.length > 0 && (
              <section className="rounded-2xl border border-dashed border-sage/60 bg-sage/15 p-3 text-xs text-sage-foreground">
                <div className="mb-1 font-semibold">Substitutions you can use</div>
                {subs.map((s) => (
                  <div key={s.for}>
                    <strong>{s.for}:</strong> {s.note}
                  </div>
                ))}
              </section>
            )}

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Steps
              </h3>
              <ol className="space-y-2 text-sm">
                {meal.steps.map((s, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <p className="text-sm text-muted-foreground">
              Quick check — did you use these? Tap to skip anything you didn't.
            </p>
            <ul className="space-y-2">
              {deltas.map((d) => {
                const isSkipped = skipped.has(d.itemId);
                return (
                  <li
                    key={d.itemId}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                      isSkipped ? "border-border bg-muted/40 opacity-60" : "border-border bg-card"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.before.toFixed(2)} → {d.after.toFixed(2)} {d.unit}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(skipped);
                        if (next.has(d.itemId)) next.delete(d.itemId);
                        else next.add(d.itemId);
                        setSkipped(next);
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                    >
                      {isSkipped ? "Use it" : "Skip"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <footer className="border-t border-border p-3">
          {step === "recipe" ? (
            <Button
              onClick={handleCooked}
              className="h-12 w-full gap-2 rounded-full text-base font-semibold"
            >
              <ChefHat className="h-5 w-5" /> Mark cooked
              <ChevronRight className="ml-auto h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={confirmConsumption}
              className="h-12 w-full gap-2 rounded-full text-base font-semibold"
            >
              <Check className="h-5 w-5" /> Update kitchen
            </Button>
          )}
        </footer>
      </motion.div>
    </div>
  );
}
