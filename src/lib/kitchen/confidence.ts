import { daysUntil } from "./shelf-life";
import type { ConfidenceState, InventoryItem } from "./types";

/**
 * Derive the current honesty state for an item. We assume drift: if the user
 * hasn't confirmed in a while AND we're past predicted expiry, it's probably
 * gone. If qty is low, running_low. If expiring within 3d, use_soon.
 */
export function deriveState(item: InventoryItem, now: Date = new Date()): ConfidenceState {
  const dExp = daysUntil(item.expiresOn, now);
  const dSinceConfirm =
    (now.getTime() - new Date(item.lastConfirmedAt).getTime()) / 86_400_000;

  if (item.qty <= 0) return "gone";
  if (dExp < -3) return "probably_gone";
  if (dExp <= 0) return "probably_gone";
  if (item.qty < 0.34) return "running_low";
  if (dExp <= 3) return "use_soon";
  if (dSinceConfirm > 14) return "probably_have";
  if (item.captureConfidence < 0.55 && dSinceConfirm > 2) return "probably_have";
  return "confirmed_have";
}

export const STATE_META: Record<
  ConfidenceState,
  { label: string; tone: string; dot: string; order: number }
> = {
  use_soon: { label: "Use soon", tone: "text-warm-foreground", dot: "bg-warm", order: 0 },
  running_low: {
    label: "Running low",
    tone: "text-warm-foreground",
    dot: "bg-sun",
    order: 1,
  },
  confirmed_have: {
    label: "Confirmed",
    tone: "text-sage-foreground",
    dot: "bg-sage",
    order: 2,
  },
  probably_have: {
    label: "Probably have",
    tone: "text-muted-foreground",
    dot: "bg-muted-foreground",
    order: 3,
  },
  probably_gone: {
    label: "Probably gone",
    tone: "text-muted-foreground",
    dot: "bg-destructive/60",
    order: 4,
  },
  gone: { label: "Gone", tone: "text-muted-foreground", dot: "bg-border", order: 5 },
};
