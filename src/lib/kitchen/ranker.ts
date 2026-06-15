import { deriveState } from "./confidence";
import { findSubs } from "./substitutions";
import { tasteScore } from "./taste-profile";
import type {
  DeckFilters,
  InventoryItem,
  Meal,
  MealIngredient,
  RankedMeal,
  TasteProfile,
} from "./types";

const norm = (s: string) => s.toLowerCase();

function ownedFor(ing: MealIngredient, inv: InventoryItem[]): InventoryItem | undefined {
  const key = norm(ing.tags?.[0] ?? ing.name);
  return inv.find(
    (i) =>
      i.qty > 0 &&
      (norm(i.name).includes(key) ||
        (i.tags ?? []).some((t) => norm(t) === key) ||
        key.includes(norm(i.name))),
  );
}

interface RankCtx {
  inventory: InventoryItem[];
  taste: TasteProfile;
  filters: DeckFilters;
  skippedIds: Set<string>;
}

export function rankMeals(meals: Meal[], ctx: RankCtx): RankedMeal[] {
  const { inventory, taste, filters, skippedIds } = ctx;

  // Hard filters first.
  let pool = meals.filter((m) => {
    if (filters.maxMinutes && m.minutes > filters.maxMinutes) return false;
    if (filters.effort && m.effort !== filters.effort) return false;
    if (filters.method && m.method !== filters.method) return false;
    if (filters.vibe && !m.vibe.includes(filters.vibe)) return false;
    if (filters.diet?.length && !filters.diet.every((d) => (m.diet ?? []).includes(d)))
      return false;
    if (filters.avoid?.length) {
      const blob = [m.title, ...m.ingredients.map((i) => i.name), ...m.tags]
        .join(" ")
        .toLowerCase();
      if (filters.avoid.some((a) => blob.includes(a.toLowerCase()))) return false;
    }
    if (filters.mustUse?.length) {
      const has = (k: string) =>
        m.ingredients.some(
          (i) => norm(i.name).includes(norm(k)) || (i.tags ?? []).includes(norm(k)),
        );
      if (!filters.mustUse.every(has)) return false;
    }
    return true;
  });

  if (pool.length === 0) pool = meals; // soft fallback so the deck never blanks

  return pool
    .map((m) => {
      const owned: InventoryItem[] = [];
      const missing: MealIngredient[] = [];
      const expiringUsed: string[] = [];

      for (const ing of m.ingredients) {
        const inv = ownedFor(ing, inventory);
        if (inv) {
          owned.push(inv);
          const st = deriveState(inv);
          if (st === "use_soon" || st === "running_low") expiringUsed.push(inv.name);
        } else if (!ing.optional) {
          missing.push(ing);
        }
      }

      const subs = findSubs(missing, inventory);
      const subbedMissing = missing.filter(
        (mi) => !subs.some((s) => s.for === mi.name),
      );

      const ownRatio = owned.length / Math.max(1, m.ingredients.length);
      const skippedPenalty = skippedIds.has(m.id) ? -2 : 0;

      const score =
        expiringUsed.length * 5 +
        ownRatio * 4 -
        subbedMissing.length * 1.5 +
        subs.length * 0.6 +
        tasteScore(taste, m) +
        skippedPenalty;

      const reasons: string[] = [];
      if (expiringUsed.length)
        reasons.push(`Uses ${expiringUsed.slice(0, 2).join(" & ")} before they go`);
      if (subbedMissing.length === 0) reasons.push("You have everything");
      else reasons.push(`${subbedMissing.length} to buy`);
      if (subs.length) reasons.push(`${subs.length} smart sub${subs.length > 1 ? "s" : ""}`);

      return {
        meal: m,
        score,
        reasons,
        missing: subbedMissing,
        expiringUsed,
        substitutions: subs,
      };
    })
    .sort((a, b) => b.score - a.score);
}
