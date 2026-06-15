import { AnimatePresence } from "framer-motion";
import { Layers, RotateCcw } from "lucide-react";
import { useState } from "react";

import { useKitchen } from "@/lib/kitchen/store";
import type { Meal, SwipeSignal } from "@/lib/kitchen/types";
import { Button } from "@/components/ui/button";

import { ConstraintBar } from "./ConstraintBar";
import { FilterChips } from "./FilterChips";
import { MealCard } from "./MealCard";
import { CookSheet } from "../cook/CookSheet";

export function MealDeck() {
  const ranked = useKitchen((s) => s.rankedDeck());
  const swipe = useKitchen((s) => s.swipe);
  const reset = useKitchen((s) => s.resetDeck);
  const [cooking, setCooking] = useState<Meal | null>(null);

  const top3 = ranked.slice(0, 3);

  function handle(signal: SwipeSignal, mealId: string) {
    swipe(mealId, signal);
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="sticky top-0 z-20 space-y-2 bg-background/85 px-4 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold tracking-tight">Tonight</h1>
          <span className="text-xs text-muted-foreground">{ranked.length} ideas</span>
        </div>
        <ConstraintBar />
        <FilterChips />
      </header>

      <div className="relative mx-4 flex-1">
        <div className="relative mx-auto h-full w-full max-w-md">
          {top3.length === 0 ? (
            <div className="app-card flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <Layers className="h-10 w-10 text-muted-foreground" />
              <p className="font-display text-xl">Out of ideas for now</p>
              <p className="text-sm text-muted-foreground">
                Capture what's in your kitchen, or reset the deck to start over.
              </p>
              <Button onClick={reset} variant="outline" className="gap-2 rounded-full">
                <RotateCcw className="h-4 w-4" /> Reset deck
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {top3
                .slice()
                .reverse()
                .map((r, i) => {
                  const stackIndex = top3.length - 1 - i;
                  return (
                    <MealCard
                      key={r.meal.id}
                      ranked={r}
                      index={stackIndex}
                      isTop={stackIndex === 0}
                      onSwipe={(sig) => handle(sig, r.meal.id)}
                      onCook={() => setCooking(r.meal)}
                    />
                  );
                })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="h-20" />

      {cooking && (
        <CookSheet meal={cooking} onClose={() => setCooking(null)} />
      )}
    </div>
  );
}
