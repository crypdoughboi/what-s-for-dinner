import { Wand2, X } from "lucide-react";

import { useKitchen } from "@/lib/kitchen/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "dinner for two under 30 minutes, use chicken",
  "cheap air fryer dinner",
  "healthy sheet pan meal using broccoli",
  "date night pasta, no dairy",
];

export function ConstraintBar() {
  const text = useKitchen((s) => s.constraintText);
  const setText = useKitchen((s) => s.setConstraintText);
  const apply = useKitchen((s) => s.applyConstraint);
  const clear = useKitchen((s) => s.clearConstraints);
  const filters = useKitchen((s) => s.filters);
  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && !(Array.isArray(v) && v.length === 0),
  );

  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-kitchen"
      >
        <Wand2 className="h-4 w-4 shrink-0 text-primary" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell Tonight what you need."
          className="h-9 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear constraints"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button type="submit" size="sm" className="h-8 rounded-full px-3 text-xs">
          Go
        </Button>
      </form>
      {!text && !hasFilters && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setText(s);
                setTimeout(apply, 0);
              }}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
