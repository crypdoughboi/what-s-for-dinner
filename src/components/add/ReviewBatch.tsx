import { AlertCircle, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useKitchen } from "@/lib/kitchen/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewBatch() {
  const batch = useKitchen((s) => s.captureBatch);
  const update = useKitchen((s) => s.updateCaptureItem);
  const remove = useKitchen((s) => s.removeCaptureItem);
  const commit = useKitchen((s) => s.commitCaptureBatch);
  const clear = useKitchen((s) => s.clearCaptureBatch);

  if (batch.length === 0) return null;

  const lowConf = batch.filter((b) => b.needsReview).length;

  return (
    <section className="app-card space-y-3 p-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-semibold">Review {batch.length} items</div>
          {lowConf > 0 && (
            <div className="flex items-center gap-1 text-xs text-warm-foreground">
              <AlertCircle className="h-3.5 w-3.5" /> {lowConf} need a quick check
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Discard
        </button>
      </header>

      <ul className="space-y-2">
        {batch.map((item) => (
          <li
            key={item.tempId}
            className={`flex items-center gap-2 rounded-2xl border p-2 ${
              item.needsReview ? "border-warm bg-warm/10" : "border-border bg-card"
            }`}
          >
            <Input
              value={item.name}
              onChange={(e) => update(item.tempId, { name: e.target.value })}
              className="h-9 flex-1 border-0 bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0"
            />
            <Input
              type="number"
              value={item.qty}
              onChange={(e) => update(item.tempId, { qty: Number(e.target.value) || 0 })}
              className="h-9 w-16 rounded-lg text-sm"
            />
            <Input
              value={item.unit}
              onChange={(e) => update(item.tempId, { unit: e.target.value })}
              className="h-9 w-20 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={() => remove(item.tempId)}
              className="rounded-full p-2 text-muted-foreground hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => {
          const n = commit();
          toast.success(`Added ${n} item${n === 1 ? "" : "s"} to your kitchen.`);
        }}
        className="h-12 w-full gap-2 rounded-full text-base font-semibold"
      >
        <Check className="h-5 w-5" /> Add {batch.length} to kitchen
      </Button>
    </section>
  );
}
