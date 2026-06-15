// Core types for the kitchen / dinner-loop system.

export type StorageLocation = "fridge" | "freezer" | "pantry" | "counter";

export type ItemCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "seafood"
  | "grain"
  | "pantry"
  | "frozen"
  | "condiment"
  | "spice"
  | "beverage"
  | "bakery"
  | "other";

export type ConfidenceState =
  | "confirmed_have"
  | "probably_have"
  | "use_soon"
  | "running_low"
  | "probably_gone"
  | "gone";

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: ItemCategory;
  location: StorageLocation;
  /** ISO date string, predicted expiry */
  expiresOn: string;
  /** ISO timestamp of last confirmation (capture, edit, post-cook confirm) */
  lastConfirmedAt: string;
  /** 0..1 model/parse confidence at capture time */
  captureConfidence: number;
  /** Tags used by ranker (e.g. "chicken", "spinach") */
  tags?: string[];
}

export type CaptureKind =
  | "receipt_photo"
  | "fridge_photo"
  | "grocery_photo"
  | "voice"
  | "pasted_text"
  | "manual";

export interface CaptureInput {
  kind: CaptureKind;
  /** Free text payload (voice transcript, pasted receipt, manual entry). */
  text?: string;
}

export interface ParsedItem {
  tempId: string;
  name: string;
  qty: number;
  unit: string;
  category: ItemCategory;
  location: StorageLocation;
  expiresOn: string;
  confidence: number;
  tags?: string[];
  /** True until the user confirms in the review batch. */
  needsReview: boolean;
}

export type MealMethod = "stovetop" | "oven" | "air-fryer" | "sheet-pan" | "no-cook" | "grill";
export type MealVibe = "cozy" | "light" | "indulgent" | "healthy" | "quick";
export type MealEffort = "easy" | "medium" | "involved";

export interface MealIngredient {
  name: string;
  qty: number;
  unit: string;
  /** Tags help the ranker match against inventory & substitutions. */
  tags?: string[];
  optional?: boolean;
}

export interface Meal {
  id: string;
  title: string;
  blurb: string;
  image?: string;
  minutes: number;
  effort: MealEffort;
  method: MealMethod;
  vibe: MealVibe[];
  servings: number;
  ingredients: MealIngredient[];
  steps: string[];
  tags: string[]; // taste profile signal
  diet?: string[]; // "vegetarian" "dairy-free" ...
}

export type SwipeSignal = "interested" | "not_interested" | "saved" | "cooked" | "skipped";

export type TasteProfile = Record<string, number>;

export interface DeckFilters {
  maxMinutes?: number;
  effort?: MealEffort;
  method?: MealMethod;
  vibe?: MealVibe;
  /** Tokens parsed from the constraint pill */
  mustUse?: string[];
  avoid?: string[];
  diet?: string[];
}

export interface RankedMeal {
  meal: Meal;
  score: number;
  reasons: string[];
  missing: MealIngredient[];
  expiringUsed: string[];
  substitutions: { for: string; using: string; note: string }[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: ItemCategory;
  unlocksMeals: string[]; // meal titles
  checked: boolean;
  isStaple?: boolean;
}
