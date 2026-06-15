import { deriveState } from "./confidence";
import type { InventoryItem, Meal, ShoppingItem } from "./types";

const STAPLES: Omit<ShoppingItem, "id" | "unlocksMeals" | "checked">[] = [
  { name: "Olive oil", qty: 1, unit: "bottle", category: "pantry", isStaple: true },
  { name: "Salt", qty: 1, unit: "box", category: "spice", isStaple: true },
  { name: "Black pepper", qty: 1, unit: "jar", category: "spice", isStaple: true },
];

function key(name: string) {
  return name.toLowerCase().trim();
}

export function buildShoppingList(
  savedMeals: Meal[],
  inventory: InventoryItem[],
  includeStaples = false,
): ShoppingItem[] {
  const owned = new Set(
    inventory
      .filter((i) => {
        const st = deriveState(i);
        return st === "confirmed_have" || st === "use_soon" || st === "probably_have";
      })
      .flatMap((i) => [key(i.name), ...(i.tags ?? []).map(key)]),
  );

  const map = new Map<string, ShoppingItem>();
  for (const meal of savedMeals) {
    for (const ing of meal.ingredients) {
      const k = key(ing.tags?.[0] ?? ing.name);
      if (owned.has(k) || [...owned].some((o) => o.includes(k) || k.includes(o))) continue;
      const existing = map.get(k);
      if (existing) {
        existing.qty = Number((existing.qty + ing.qty).toFixed(2));
        if (!existing.unlocksMeals.includes(meal.title))
          existing.unlocksMeals.push(meal.title);
      } else {
        map.set(k, {
          id: `s-${k}`,
          name: ing.name,
          qty: ing.qty,
          unit: ing.unit,
          category: "other",
          unlocksMeals: [meal.title],
          checked: false,
        });
      }
    }
  }

  const items = Array.from(map.values());
  if (includeStaples) {
    for (const s of STAPLES) {
      if (!owned.has(key(s.name)))
        items.push({ ...s, id: `staple-${key(s.name)}`, unlocksMeals: [], checked: false });
    }
  }
  return items;
}
