import type { InventoryItem, MealIngredient } from "./types";

interface SubRule {
  for: string; // missing ingredient tag
  using: string[]; // alternative tags (all must be present for compound)
  note: string;
}

const RULES: SubRule[] = [
  { for: "buttermilk", using: ["milk", "lemon"], note: "1 cup milk + 1 tbsp lemon juice" },
  { for: "sour cream", using: ["greek yogurt"], note: "Sub Greek yogurt 1:1" },
  { for: "kale", using: ["spinach"], note: "Spinach works 1:1" },
  { for: "quinoa", using: ["rice"], note: "Rice subs 1:1" },
  { for: "pita", using: ["tortilla"], note: "Tortillas work great" },
  { for: "cooked beans", using: ["canned beans"], note: "Drain & rinse the can" },
  { for: "fresh vegetables", using: ["frozen vegetables"], note: "Fine when cooked" },
  { for: "fresh spinach", using: ["frozen spinach"], note: "Thaw and squeeze dry" },
  { for: "heavy cream", using: ["milk", "butter"], note: "¾ c milk + ¼ c melted butter" },
  { for: "shallot", using: ["onion"], note: "½ small onion subs" },
  { for: "lime", using: ["lemon"], note: "Lemon works" },
  { for: "cilantro", using: ["parsley"], note: "Parsley if you dislike cilantro" },
  { for: "scallion", using: ["onion"], note: "Tiny diced onion works" },
  { for: "panko", using: ["bread"], note: "Toast & crumble bread" },
  { for: "parmesan", using: ["pecorino"], note: "Pecorino subs 1:1" },
];

const has = (inv: InventoryItem[], tag: string) =>
  inv.some(
    (i) =>
      i.qty > 0 &&
      (i.name.toLowerCase().includes(tag) || (i.tags ?? []).includes(tag)),
  );

export interface SubMatch {
  for: string;
  using: string;
  note: string;
}

export function findSubs(missing: MealIngredient[], inventory: InventoryItem[]): SubMatch[] {
  const out: SubMatch[] = [];
  for (const m of missing) {
    const key = (m.tags?.[0] ?? m.name).toLowerCase();
    const rule = RULES.find((r) => key.includes(r.for));
    if (!rule) continue;
    if (rule.using.every((t) => has(inventory, t))) {
      out.push({ for: m.name, using: rule.using.join(" + "), note: rule.note });
    }
  }
  return out;
}
