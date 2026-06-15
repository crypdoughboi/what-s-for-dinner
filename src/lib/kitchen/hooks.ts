import { useMemo } from "react";

import { rankMeals } from "./ranker";
import { buildShoppingList } from "./shopping";
import { useKitchen } from "./store";
import type { RankedMeal, ShoppingItem } from "./types";

export function useRankedDeck(): RankedMeal[] {
  const meals = useKitchen((s) => s.meals);
  const inventory = useKitchen((s) => s.inventory);
  const taste = useKitchen((s) => s.taste);
  const filters = useKitchen((s) => s.filters);
  const savedMealIds = useKitchen((s) => s.savedMealIds);
  const cookedMealIds = useKitchen((s) => s.cookedMealIds);
  const skippedMealIds = useKitchen((s) => s.skippedMealIds);
  const decisionLog = useKitchen((s) => s.decisionLog);

  return useMemo(() => {
    const decided = new Set([
      ...savedMealIds,
      ...cookedMealIds,
      ...decisionLog.filter((d) => d.signal === "not_interested").map((d) => d.mealId),
    ]);
    const pool = meals.filter((m) => !decided.has(m.id));
    return rankMeals(pool, {
      inventory,
      taste,
      filters,
      skippedIds: new Set(skippedMealIds),
    });
  }, [meals, inventory, taste, filters, savedMealIds, cookedMealIds, skippedMealIds, decisionLog]);
}

export function useShoppingList(): ShoppingItem[] {
  const meals = useKitchen((s) => s.meals);
  const inventory = useKitchen((s) => s.inventory);
  const savedMealIds = useKitchen((s) => s.savedMealIds);
  const cookedMealIds = useKitchen((s) => s.cookedMealIds);
  const shoppingChecked = useKitchen((s) => s.shoppingChecked);

  return useMemo(() => {
    const saved = meals.filter(
      (m) => savedMealIds.includes(m.id) || cookedMealIds.includes(m.id),
    );
    return buildShoppingList(saved, inventory, true).map((it) => ({
      ...it,
      checked: shoppingChecked[it.id] ?? false,
    }));
  }, [meals, inventory, savedMealIds, cookedMealIds, shoppingChecked]);
}

export function useSavedMeals() {
  const meals = useKitchen((s) => s.meals);
  const savedMealIds = useKitchen((s) => s.savedMealIds);
  return useMemo(
    () => meals.filter((m) => savedMealIds.includes(m.id)),
    [meals, savedMealIds],
  );
}
