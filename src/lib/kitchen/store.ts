import { create } from "zustand";

import { parseConstraint } from "./constraint-parser";
import { inferConsumption } from "./cook-infer";
import { rankMeals } from "./ranker";
import { SEED_INVENTORY, SEED_MEALS } from "./seed";
import { buildShoppingList } from "./shopping";
import { applySwipe } from "./taste-profile";
import type {
  DeckFilters,
  InventoryItem,
  Meal,
  ParsedItem,
  RankedMeal,
  ShoppingItem,
  SwipeSignal,
  TasteProfile,
} from "./types";

interface KitchenState {
  inventory: InventoryItem[];
  meals: Meal[];
  taste: TasteProfile;
  savedMealIds: string[];
  cookedMealIds: string[];
  skippedMealIds: string[];
  decisionLog: { mealId: string; signal: SwipeSignal; at: string }[];
  filters: DeckFilters;
  constraintText: string;
  captureBatch: ParsedItem[];
  shoppingChecked: Record<string, boolean>;

  // selectors
  rankedDeck: () => RankedMeal[];
  shoppingList: () => ShoppingItem[];
  savedMeals: () => Meal[];

  // actions
  setConstraintText: (s: string) => void;
  applyConstraint: () => void;
  clearConstraints: () => void;
  setFilter: <K extends keyof DeckFilters>(k: K, v: DeckFilters[K]) => void;
  swipe: (mealId: string, signal: SwipeSignal) => void;
  resetDeck: () => void;

  stageCapture: (items: ParsedItem[]) => void;
  updateCaptureItem: (tempId: string, patch: Partial<ParsedItem>) => void;
  removeCaptureItem: (tempId: string) => void;
  commitCaptureBatch: () => number;
  clearCaptureBatch: () => void;

  confirmItem: (id: string) => void;
  adjustItemQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;

  markCooked: (mealId: string) => { itemId: string; name: string; before: number; after: number; unit: string }[];
  applyConsumption: (
    deltas: { itemId: string; after: number }[],
  ) => void;

  toggleShoppingItem: (id: string) => void;
  clearCheckedShopping: () => void;
  resetAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

export const useKitchen = create<KitchenState>()(
  persist(
    (set, get) => ({
      inventory: SEED_INVENTORY,
      meals: SEED_MEALS,
      taste: {},
      savedMealIds: [],
      cookedMealIds: [],
      skippedMealIds: [],
      decisionLog: [],
      filters: {},
      constraintText: "",
      captureBatch: [],
      shoppingChecked: {},

      rankedDeck: () => {
        const s = get();
        const decided = new Set([
          ...s.savedMealIds,
          ...s.cookedMealIds,
          ...s.decisionLog
            .filter((d) => d.signal === "not_interested")
            .map((d) => d.mealId),
        ]);
        const pool = s.meals.filter((m) => !decided.has(m.id));
        return rankMeals(pool, {
          inventory: s.inventory,
          taste: s.taste,
          filters: s.filters,
          skippedIds: new Set(s.skippedMealIds),
        });
      },

      shoppingList: () => {
        const s = get();
        const saved = s.meals.filter(
          (m) => s.savedMealIds.includes(m.id) || s.cookedMealIds.includes(m.id),
        );
        return buildShoppingList(saved, s.inventory, true).map((it) => ({
          ...it,
          checked: s.shoppingChecked[it.id] ?? false,
        }));
      },

      savedMeals: () => {
        const s = get();
        return s.meals.filter((m) => s.savedMealIds.includes(m.id));
      },

      setConstraintText: (constraintText) => set({ constraintText }),
      applyConstraint: () => {
        const parsed = parseConstraint(get().constraintText);
        set({ filters: { ...get().filters, ...parsed } });
      },
      clearConstraints: () => set({ constraintText: "", filters: {} }),
      setFilter: (k, v) =>
        set({ filters: { ...get().filters, [k]: v === get().filters[k] ? undefined : v } }),

      swipe: (mealId, signal) => {
        const meal = get().meals.find((m) => m.id === mealId);
        if (!meal) return;
        const s = get();
        const taste = applySwipe(s.taste, meal, signal);
        const next: Partial<KitchenState> = {
          taste,
          decisionLog: [...s.decisionLog, { mealId, signal, at: nowIso() }],
        };
        if (signal === "saved" && !s.savedMealIds.includes(mealId))
          next.savedMealIds = [...s.savedMealIds, mealId];
        if (signal === "skipped")
          next.skippedMealIds = Array.from(new Set([...s.skippedMealIds, mealId]));
        set(next);
      },

      resetDeck: () =>
        set({
          decisionLog: [],
          skippedMealIds: [],
          cookedMealIds: [],
          savedMealIds: [],
          filters: {},
          constraintText: "",
        }),

      stageCapture: (items) => set({ captureBatch: [...get().captureBatch, ...items] }),
      updateCaptureItem: (tempId, patch) =>
        set({
          captureBatch: get().captureBatch.map((i) =>
            i.tempId === tempId ? { ...i, ...patch, needsReview: false } : i,
          ),
        }),
      removeCaptureItem: (tempId) =>
        set({ captureBatch: get().captureBatch.filter((i) => i.tempId !== tempId) }),
      commitCaptureBatch: () => {
        const s = get();
        const newItems: InventoryItem[] = s.captureBatch.map((p) => ({
          id: uid(),
          name: p.name,
          qty: p.qty,
          unit: p.unit,
          category: p.category,
          location: p.location,
          expiresOn: p.expiresOn,
          lastConfirmedAt: nowIso(),
          captureConfidence: p.confidence,
          tags: p.tags,
        }));
        set({ inventory: [...s.inventory, ...newItems], captureBatch: [] });
        return newItems.length;
      },
      clearCaptureBatch: () => set({ captureBatch: [] }),

      confirmItem: (id) =>
        set({
          inventory: get().inventory.map((i) =>
            i.id === id ? { ...i, lastConfirmedAt: nowIso(), captureConfidence: 1 } : i,
          ),
        }),
      adjustItemQty: (id, qty) =>
        set({
          inventory: get().inventory.map((i) =>
            i.id === id ? { ...i, qty, lastConfirmedAt: nowIso() } : i,
          ),
        }),
      removeItem: (id) =>
        set({ inventory: get().inventory.filter((i) => i.id !== id) }),

      markCooked: (mealId) => {
        const s = get();
        const meal = s.meals.find((m) => m.id === mealId);
        if (!meal) return [];
        const deltas = inferConsumption(meal, s.inventory);
        set({
          cookedMealIds: Array.from(new Set([...s.cookedMealIds, mealId])),
          taste: applySwipe(s.taste, meal, "cooked"),
        });
        return deltas;
      },
      applyConsumption: (deltas) => {
        const map = new Map(deltas.map((d) => [d.itemId, d.after]));
        set({
          inventory: get().inventory.map((i) =>
            map.has(i.id)
              ? { ...i, qty: map.get(i.id)!, lastConfirmedAt: nowIso() }
              : i,
          ),
        });
      },

      toggleShoppingItem: (id) =>
        set({
          shoppingChecked: {
            ...get().shoppingChecked,
            [id]: !get().shoppingChecked[id],
          },
        }),
      clearCheckedShopping: () => set({ shoppingChecked: {} }),

      resetAll: () =>
        set({
          inventory: SEED_INVENTORY,
          meals: SEED_MEALS,
          taste: {},
          savedMealIds: [],
          cookedMealIds: [],
          skippedMealIds: [],
          decisionLog: [],
          filters: {},
          constraintText: "",
          captureBatch: [],
          shoppingChecked: {},
        }),
    }),
    { name: "wtf-kitchen-v1" },
  ),
);
