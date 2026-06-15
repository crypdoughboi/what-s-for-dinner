import type { ItemCategory, StorageLocation } from "./types";

/** Typical shelf life in days, keyed by category × location. */
const TABLE: Partial<Record<ItemCategory, Partial<Record<StorageLocation, number>>>> = {
  produce: { fridge: 7, counter: 4, freezer: 240 },
  dairy: { fridge: 10, freezer: 60 },
  meat: { fridge: 3, freezer: 120 },
  seafood: { fridge: 2, freezer: 90 },
  bakery: { counter: 4, fridge: 7, freezer: 60 },
  grain: { pantry: 365, fridge: 14 },
  pantry: { pantry: 365 },
  frozen: { freezer: 180 },
  condiment: { fridge: 180, pantry: 365 },
  spice: { pantry: 730 },
  beverage: { fridge: 30, pantry: 180 },
  other: { fridge: 14, pantry: 60, freezer: 90, counter: 5 },
};

export function shelfLifeDays(category: ItemCategory, location: StorageLocation): number {
  return TABLE[category]?.[location] ?? 7;
}

export function predictExpiry(
  category: ItemCategory,
  location: StorageLocation,
  from: Date = new Date(),
): string {
  const d = new Date(from);
  d.setDate(d.getDate() + shelfLifeDays(category, location));
  return d.toISOString();
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000);
}
