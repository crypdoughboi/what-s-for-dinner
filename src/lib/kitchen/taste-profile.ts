import type { Meal, SwipeSignal, TasteProfile } from "./types";

const WEIGHTS: Record<SwipeSignal, number> = {
  interested: 1,
  not_interested: -1.2,
  saved: 1.5,
  cooked: 2.5,
  skipped: -0.3,
};

export function applySwipe(
  profile: TasteProfile,
  meal: Meal,
  signal: SwipeSignal,
): TasteProfile {
  const w = WEIGHTS[signal];
  const next = { ...profile };
  for (const tag of meal.tags) {
    next[tag] = (next[tag] ?? 0) + w;
  }
  next[`__method:${meal.method}`] = (next[`__method:${meal.method}`] ?? 0) + w * 0.6;
  for (const v of meal.vibe) {
    next[`__vibe:${v}`] = (next[`__vibe:${v}`] ?? 0) + w * 0.5;
  }
  return next;
}

export function tasteScore(profile: TasteProfile, meal: Meal): number {
  let s = 0;
  for (const t of meal.tags) s += profile[t] ?? 0;
  s += (profile[`__method:${meal.method}`] ?? 0) * 0.5;
  for (const v of meal.vibe) s += (profile[`__vibe:${v}`] ?? 0) * 0.4;
  return s;
}
