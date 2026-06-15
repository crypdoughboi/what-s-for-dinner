import { useKitchen } from "@/lib/kitchen/store";
import type { DeckFilters, MealMethod, MealVibe } from "@/lib/kitchen/types";

const TIMES: { label: string; max: number }[] = [
  { label: "≤15m", max: 15 },
  { label: "≤30m", max: 30 },
  { label: "≤45m", max: 45 },
];
const METHODS: MealMethod[] = ["stovetop", "oven", "air-fryer", "sheet-pan", "no-cook"];
const VIBES: MealVibe[] = ["cozy", "light", "healthy", "indulgent", "quick"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterChips() {
  const filters = useKitchen((s) => s.filters);
  const setFilter = useKitchen((s) => s.setFilter);

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto py-1">
      {TIMES.map((t) => (
        <Chip
          key={t.label}
          active={filters.maxMinutes === t.max}
          onClick={() =>
            setFilter<keyof DeckFilters>("maxMinutes", filters.maxMinutes === t.max ? undefined : t.max)
          }
        >
          {t.label}
        </Chip>
      ))}
      {METHODS.map((m) => (
        <Chip
          key={m}
          active={filters.method === m}
          onClick={() => setFilter("method", m)}
        >
          {m.replace("-", " ")}
        </Chip>
      ))}
      {VIBES.map((v) => (
        <Chip key={v} active={filters.vibe === v} onClick={() => setFilter("vibe", v)}>
          {v}
        </Chip>
      ))}
    </div>
  );
}
