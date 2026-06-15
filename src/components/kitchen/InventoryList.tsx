import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { deriveState, STATE_META } from "@/lib/kitchen/confidence";
import { daysUntil } from "@/lib/kitchen/shelf-life";
import { useKitchen } from "@/lib/kitchen/store";
import type { ConfidenceState, InventoryItem } from "@/lib/kitchen/types";

import { ConfidenceDot } from "./ConfidenceDot";

const ORDER: ConfidenceState[] = [
  "use_soon",
  "running_low",
  "confirmed_have",
  "probably_have",
  "probably_gone",
  "gone",
];

function expiryLabel(item: InventoryItem) {
  const d = daysUntil(item.expiresOn);
  if (d < 0) return `${-d}d past`;
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d < 14) return `${d}d`;
  if (d < 60) return `${Math.round(d / 7)}w`;
  return `${Math.round(d / 30)}mo`;
}

function Row({ item }: { item: InventoryItem }) {
  const confirm = useKitchen((s) => s.confirmItem);
  const adjust = useKitchen((s) => s.adjustItemQty);
  const remove = useKitchen((s) => s.removeItem);
  const state = deriveState(item);

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5">
      <ConfidenceDot state={state} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{item.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {item.qty} {item.unit}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{item.location}</span>
          <span>·</span>
          <span>{expiryLabel(item)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjust(item.id, Math.max(0, Number((item.qty - 0.25).toFixed(2))))}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Less"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => adjust(item.id, Number((item.qty + 0.25).toFixed(2)))}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="More"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => confirm(item.id)}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Confirm"
          title="Still have it"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => remove(item.id)}
          className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function InventoryList() {
  const inventory = useKitchen((s) => s.inventory);

  const groups = useMemo(() => {
    const map = new Map<ConfidenceState, InventoryItem[]>();
    for (const i of inventory) {
      const st = deriveState(i);
      if (!map.has(st)) map.set(st, []);
      map.get(st)!.push(i);
    }
    return ORDER.filter((s) => map.has(s)).map((s) => ({ state: s, items: map.get(s)! }));
  }, [inventory]);

  if (inventory.length === 0) {
    return (
      <div className="app-card p-6 text-center text-sm text-muted-foreground">
        Your kitchen is empty. Head to Add to capture what you have.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(({ state, items }) => (
        <section key={state}>
          <header className="mb-2 flex items-baseline justify-between px-1">
            <h3 className={`text-sm font-semibold ${STATE_META[state].tone}`}>
              {STATE_META[state].label}
            </h3>
            <span className="text-xs text-muted-foreground">{items.length}</span>
          </header>
          <ul className="space-y-1.5">
            {items.map((i) => (
              <Row key={i.id} item={i} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
