import { Check, RefreshCcw, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { useShoppingList, useSavedMeals } from "@/lib/kitchen/hooks";
import { useKitchen } from "@/lib/kitchen/store";
import type { ShoppingItem } from "@/lib/kitchen/types";
import { Button } from "@/components/ui/button";

function groupByMeal(items: ShoppingItem[]) {
  const map = new Map<string, ShoppingItem[]>();
  for (const it of items) {
    const key = it.isStaple ? "Staples" : (it.unlocksMeals[0] ?? "Other");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries());
}

export function ShoppingList() {
  const items = useShoppingList();
  const toggle = useKitchen((s) => s.toggleShoppingItem);
  const clearChecked = useKitchen((s) => s.clearCheckedShopping);
  const savedMeals = useSavedMeals();

  const groups = useMemo(() => groupByMeal(items), [items]);
  const checkedCount = items.filter((i) => i.checked).length;

  if (items.length === 0) {
    return (
      <div className="app-card p-6 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-display text-lg">Nothing to buy yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Swipe up to save meals on the Deck. We'll only add what you don't already have.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          From {savedMeals.length} saved meal{savedMeals.length === 1 ? "" : "s"} ·{" "}
          {items.length - checkedCount} left
        </span>
        {checkedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChecked();
              toast.success("Checked items cleared.");
            }}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear {checkedCount}
          </Button>
        )}
      </div>

      {groups.map(([heading, list]) => (
        <section key={heading}>
          <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold">
            {heading === "Staples" ? (
              <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <span className="text-primary">Unlocks:</span>
            )}
            <span>{heading}</span>
          </h3>
          <ul className="space-y-1.5">
            {list.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => toggle(it.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-2.5 text-left transition-colors ${
                    it.checked ? "bg-muted/50" : "bg-card"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      it.checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {it.checked && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className={`flex-1 truncate ${
                      it.checked ? "text-muted-foreground line-through" : "font-medium"
                    }`}
                  >
                    {it.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {it.qty} {it.unit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
