import {
  Camera,
  ClipboardPaste,
  Mic,
  Pencil,
  Refrigerator,
  ShoppingBag,
} from "lucide-react";

import type { CaptureKind } from "@/lib/kitchen/types";

interface Tile {
  kind: CaptureKind;
  title: string;
  hint: string;
  icon: typeof Camera;
  size: "lg" | "md" | "sm";
}

const TILES: Tile[] = [
  { kind: "receipt_photo", title: "Receipt photo", hint: "Snap your grocery receipt", icon: Camera, size: "lg" },
  { kind: "fridge_photo", title: "Fridge photo", hint: "Open it, point, shoot", icon: Refrigerator, size: "md" },
  { kind: "grocery_photo", title: "Grocery haul", hint: "Photo the bags on the counter", icon: ShoppingBag, size: "md" },
  { kind: "voice", title: "Voice add", hint: "Talk it through", icon: Mic, size: "sm" },
  { kind: "pasted_text", title: "Paste receipt", hint: "From an email or app", icon: ClipboardPaste, size: "sm" },
];

export function CaptureGrid({ onPick }: { onPick: (kind: CaptureKind) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onPick("receipt_photo")}
          className="app-card relative flex h-40 flex-col justify-between overflow-hidden p-5 text-left transition-transform active:scale-[0.99]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-warm/10 to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold">Receipt photo</div>
              <div className="text-sm text-muted-foreground">The fastest way to log a haul</div>
            </div>
          </div>
          <span className="relative z-10 text-xs font-medium text-primary">
            Recommended →
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TILES.slice(1, 3).map(({ kind, title, hint, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => onPick(kind)}
            className="app-card flex h-32 flex-col justify-between p-4 text-left transition-transform active:scale-[0.98]"
          >
            <div className="rounded-xl bg-accent p-2 text-accent-foreground w-fit">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">{hint}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TILES.slice(3).map(({ kind, title, hint, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => onPick(kind)}
            className="app-card flex h-24 items-center gap-3 p-3 text-left transition-transform active:scale-[0.98]"
          >
            <div className="rounded-xl bg-muted p-2 text-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{title}</div>
              <div className="truncate text-xs text-muted-foreground">{hint}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onPick("manual")}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-4 w-4" /> Add manually
      </button>
    </div>
  );
}
