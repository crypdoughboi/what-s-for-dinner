import type { InventoryItem, Meal } from "./types";

export interface ConsumptionDelta {
  itemId: string;
  name: string;
  before: number;
  after: number;
  unit: string;
  confidence: number;
}

/** Rough decrement of inventory based on the meal's ingredients. */
export function inferConsumption(meal: Meal, inventory: InventoryItem[]): ConsumptionDelta[] {
  const out: ConsumptionDelta[] = [];
  for (const ing of meal.ingredients) {
    const key = (ing.tags?.[0] ?? ing.name).toLowerCase();
    const inv = inventory.find(
      (i) =>
        i.qty > 0 &&
        (i.name.toLowerCase().includes(key) || (i.tags ?? []).includes(key)),
    );
    if (!inv) continue;
    // Treat each ing as a unit slice of total stock.
    const used = Math.min(inv.qty, ing.qty || 0.34);
    out.push({
      itemId: inv.id,
      name: inv.name,
      before: inv.qty,
      after: Math.max(0, Number((inv.qty - used).toFixed(2))),
      unit: inv.unit,
      confidence: ing.optional ? 0.5 : 0.85,
    });
  }
  return out;
}
