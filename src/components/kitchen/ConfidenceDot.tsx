import { STATE_META } from "@/lib/kitchen/confidence";
import type { ConfidenceState } from "@/lib/kitchen/types";

export function ConfidenceDot({ state }: { state: ConfidenceState }) {
  const meta = STATE_META[state];
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${meta.dot}`}
      title={meta.label}
      aria-label={meta.label}
    />
  );
}
