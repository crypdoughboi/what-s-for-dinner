import { predictExpiry } from "./shelf-life";
import type {
  CaptureInput,
  ItemCategory,
  ParsedItem,
  StorageLocation,
} from "./types";

/* eslint-disable @typescript-eslint/no-unused-vars */

const uid = () => Math.random().toString(36).slice(2, 10);

interface RawItem {
  name: string;
  qty?: number;
  unit?: string;
  category?: ItemCategory;
  location?: StorageLocation;
  tags?: string[];
  confidence?: number;
}

const CATEGORY_HINTS: { match: RegExp; cat: ItemCategory; loc: StorageLocation }[] = [
  { match: /milk|yogurt|cheese|butter|cream/i, cat: "dairy", loc: "fridge" },
  { match: /chicken|beef|pork|turkey|bacon|sausage/i, cat: "meat", loc: "fridge" },
  { match: /salmon|tuna|shrimp|fish|cod/i, cat: "seafood", loc: "fridge" },
  { match: /spinach|kale|lettuce|tomato|onion|pepper|broccoli|carrot|cucumber|garlic|lemon|lime|avocado|apple|banana|berry|cilantro|parsley|scallion|mushroom|zucchini|potato/i, cat: "produce", loc: "fridge" },
  { match: /rice|pasta|quinoa|oats|noodle|flour|bread|tortilla|pita/i, cat: "grain", loc: "pantry" },
  { match: /beans?|chickpea|lentil/i, cat: "pantry", loc: "pantry" },
  { match: /sauce|ketchup|mayo|mustard|vinegar|soy|sriracha|gochujang/i, cat: "condiment", loc: "fridge" },
  { match: /frozen|peas|edamame/i, cat: "frozen", loc: "freezer" },
  { match: /salt|pepper|cumin|paprika|cinnamon|chili|oregano|thyme/i, cat: "spice", loc: "pantry" },
  { match: /water|juice|seltzer|wine|beer/i, cat: "beverage", loc: "fridge" },
  { match: /baguette|loaf|bagel|muffin/i, cat: "bakery", loc: "counter" },
];

function classify(name: string): { cat: ItemCategory; loc: StorageLocation; tags: string[] } {
  for (const h of CATEGORY_HINTS) {
    if (h.match.test(name)) {
      return { cat: h.cat, loc: h.loc, tags: [name.toLowerCase().split(/\s+/)[0]] };
    }
  }
  return { cat: "other", loc: "pantry", tags: [name.toLowerCase().split(/\s+/)[0]] };
}

function finalize(raw: RawItem[]): ParsedItem[] {
  return raw.map((r) => {
    const c = classify(r.name);
    const cat = r.category ?? c.cat;
    const loc = r.location ?? c.loc;
    const confidence = r.confidence ?? 0.78;
    return {
      tempId: uid(),
      name: r.name,
      qty: r.qty ?? 1,
      unit: r.unit ?? "unit",
      category: cat,
      location: loc,
      tags: r.tags ?? c.tags,
      expiresOn: predictExpiry(cat, loc),
      confidence,
      needsReview: confidence < 0.7,
    };
  });
}

/* ---------- branch parsers (simulated for the MVP) ---------- */

function parseReceiptPhoto(): ParsedItem[] {
  // Curated realistic receipt extraction.
  return finalize([
    { name: "Whole milk", qty: 1, unit: "gal", confidence: 0.94 },
    { name: "Greek yogurt", qty: 2, unit: "cup", confidence: 0.91 },
    { name: "Boneless chicken thighs", qty: 1.2, unit: "lb", confidence: 0.88 },
    { name: "Baby spinach", qty: 1, unit: "bag", confidence: 0.82 },
    { name: "Cherry tomatoes", qty: 1, unit: "pint", confidence: 0.86 },
    { name: "Brown rice", qty: 1, unit: "bag", confidence: 0.74 },
    { name: "Sourdough loaf", qty: 1, unit: "loaf", confidence: 0.61 },
  ]);
}

function parseFridgePhoto(): ParsedItem[] {
  return finalize([
    { name: "Eggs", qty: 8, unit: "ea", confidence: 0.92 },
    { name: "Butter", qty: 1, unit: "stick", confidence: 0.88 },
    { name: "Cheddar cheese", qty: 0.5, unit: "block", confidence: 0.68 },
    { name: "Cilantro", qty: 1, unit: "bunch", confidence: 0.55 },
    { name: "Lemon", qty: 2, unit: "ea", confidence: 0.83 },
    { name: "Sriracha", qty: 1, unit: "bottle", confidence: 0.9 },
  ]);
}

function parseGroceryPhoto(): ParsedItem[] {
  return finalize([
    { name: "Tortillas", qty: 1, unit: "pack", confidence: 0.89 },
    { name: "Salmon fillet", qty: 0.8, unit: "lb", confidence: 0.86 },
    { name: "Avocado", qty: 2, unit: "ea", confidence: 0.93 },
    { name: "Red onion", qty: 1, unit: "ea", confidence: 0.84 },
    { name: "Lime", qty: 3, unit: "ea", confidence: 0.9 },
  ]);
}

function parseVoice(text: string): ParsedItem[] {
  if (!text.trim()) {
    return finalize([
      { name: "Pasta", qty: 1, unit: "box", confidence: 0.8 },
      { name: "Parmesan", qty: 1, unit: "wedge", confidence: 0.72 },
    ]);
  }
  return parsePasted(text);
}

function parsePasted(text: string): ParsedItem[] {
  const lines = text
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  const raw: RawItem[] = lines.slice(0, 25).map((line) => {
    // Match "2 lb chicken" / "milk x2" / "1 bag spinach" / "spinach"
    const m =
      line.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?\s+(.+)$/i) ||
      line.match(/^(.+?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)$/i);
    if (!m) return { name: line, qty: 1, unit: "unit", confidence: 0.7 };
    if (m.length === 4) {
      return { name: m[3], qty: Number(m[1]), unit: m[2] ?? "unit", confidence: 0.84 };
    }
    return { name: m[1], qty: Number(m[2]), unit: "unit", confidence: 0.84 };
  });
  return finalize(raw);
}

function parseManual(text: string): ParsedItem[] {
  if (!text.trim()) return [];
  return parsePasted(text);
}

export function parseCapture(input: CaptureInput): ParsedItem[] {
  switch (input.kind) {
    case "receipt_photo":
      return parseReceiptPhoto();
    case "fridge_photo":
      return parseFridgePhoto();
    case "grocery_photo":
      return parseGroceryPhoto();
    case "voice":
      return parseVoice(input.text ?? "");
    case "pasted_text":
      return parsePasted(input.text ?? "");
    case "manual":
      return parseManual(input.text ?? "");
  }
}
