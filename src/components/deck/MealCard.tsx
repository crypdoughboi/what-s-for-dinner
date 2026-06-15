import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Bookmark, ChefHat, Clock, Flame, Sparkles, X } from "lucide-react";

import type { RankedMeal, SwipeSignal } from "@/lib/kitchen/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  ranked: RankedMeal;
  onSwipe: (signal: SwipeSignal) => void;
  onCook: () => void;
  /** index from top of stack (0 = active) */
  index: number;
  isTop: boolean;
}

export function MealCard({ ranked, onSwipe, onCook, index, isTop }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const yesOpacity = useTransform(x, [40, 140], [0, 1]);
  const noOpacity = useTransform(x, [-140, -40], [1, 0]);
  const saveOpacity = useTransform(y, [-140, -40], [1, 0]);

  const { meal, reasons, missing, expiringUsed, substitutions } = ranked;

  function handleEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x > 110 || velocity.x > 700) return onSwipe("interested");
    if (offset.x < -110 || velocity.x < -700) return onSwipe("not_interested");
    if (offset.y < -110 || velocity.y < -700) return onSwipe("saved");
    x.set(0);
    y.set(0);
  }

  return (
    <motion.article
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleEnd}
      style={{
        x,
        y,
        rotate,
        zIndex: 10 - index,
        scale: 1 - index * 0.04,
        y: index * 8,
      }}
      animate={{ scale: 1 - index * 0.04, y: index * 8 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="app-card absolute inset-0 flex touch-none flex-col overflow-hidden bg-card"
    >
      <div className="relative h-[46%] w-full overflow-hidden bg-muted">
        {meal.image ? (
          <img
            src={meal.image}
            alt={meal.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-warm/40 to-primary/30 text-primary-foreground">
            <ChefHat className="h-16 w-16 opacity-70" />
          </div>
        )}

        {/* Gesture hints */}
        <motion.div
          style={{ opacity: yesOpacity }}
          className="absolute left-4 top-4 rounded-full bg-sage px-3 py-1 text-sm font-semibold text-sage-foreground shadow-kitchen"
        >
          Interested
        </motion.div>
        <motion.div
          style={{ opacity: noOpacity }}
          className="absolute right-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground shadow-kitchen"
        >
          Pass
        </motion.div>
        <motion.div
          style={{ opacity: saveOpacity }}
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow-kitchen"
        >
          Saved
        </motion.div>

        {expiringUsed.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-warm/95 px-2.5 py-1 text-xs font-semibold text-warm-foreground shadow-kitchen">
            <Flame className="h-3.5 w-3.5" /> Uses {expiringUsed[0]}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <header>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            {meal.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meal.blurb}</p>
        </header>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="gap-1 rounded-full">
            <Clock className="h-3 w-3" /> {meal.minutes} min
          </Badge>
          <Badge variant="secondary" className="rounded-full capitalize">
            {meal.effort}
          </Badge>
          <Badge variant="secondary" className="rounded-full capitalize">
            {meal.method.replace("-", " ")}
          </Badge>
          {meal.vibe.slice(0, 1).map((v) => (
            <Badge key={v} variant="secondary" className="rounded-full capitalize">
              {v}
            </Badge>
          ))}
        </div>

        <ul className="space-y-1 text-sm">
          {reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-start gap-2 text-foreground/80">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        {substitutions.length > 0 && (
          <div className="rounded-2xl border border-dashed border-sage/60 bg-sage/15 p-3 text-xs text-sage-foreground">
            <div className="mb-1 font-semibold">Smart subs</div>
            {substitutions.slice(0, 2).map((s) => (
              <div key={s.for} className="leading-snug">
                <span className="font-medium">{s.for}:</span> {s.note}
              </div>
            ))}
          </div>
        )}

        {missing.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Missing: {missing.slice(0, 3).map((m) => m.name).join(", ")}
            {missing.length > 3 ? `, +${missing.length - 3} more` : ""}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Pass"
            onClick={() => onSwipe("not_interested")}
            className="h-12 w-12 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Save"
            onClick={() => onSwipe("saved")}
            className="h-12 w-12 rounded-full"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            onClick={onCook}
            className="ml-auto h-12 flex-1 gap-2 rounded-full text-base font-semibold"
          >
            <ChefHat className="h-5 w-5" /> Cook this
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
