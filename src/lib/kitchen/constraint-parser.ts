import type { DeckFilters, MealMethod, MealVibe } from "./types";

const METHODS: MealMethod[] = ["stovetop", "oven", "air-fryer", "sheet-pan", "no-cook", "grill"];
const VIBES: MealVibe[] = ["cozy", "light", "indulgent", "healthy", "quick"];
const DIETS = ["vegetarian", "vegan", "dairy-free", "gluten-free", "pescatarian"];

const STOP = new Set([
  "a","an","the","with","using","for","of","and","or","please","tonight","make","want","dinner","lunch","meal","some",
]);

export function parseConstraint(raw: string): DeckFilters {
  const text = raw.toLowerCase();
  const out: DeckFilters = {};

  const mins = text.match(/(?:under|less than|<)\s*(\d{1,3})\s*(?:min|minutes?)/);
  if (mins) out.maxMinutes = Number(mins[1]);
  else if (/quick|fast|speedy|15\s*minute/.test(text)) out.maxMinutes = 20;

  for (const m of METHODS) {
    const probe = m.replace("-", " ");
    if (text.includes(probe)) out.method = m;
  }
  for (const v of VIBES) if (text.includes(v)) out.vibe = v;

  out.diet = DIETS.filter((d) => text.includes(d));
  if (/no dairy|dairy[- ]free/.test(text)) out.diet.push("dairy-free");
  if (/no meat|vegetarian/.test(text)) out.diet.push("vegetarian");
  out.diet = Array.from(new Set(out.diet));

  // Avoid: "no X", "without X", "skip X"
  const avoid: string[] = [];
  for (const m of text.matchAll(/(?:no|without|skip|hate)\s+([a-z][a-z\s]{1,20})/g)) {
    const tok = m[1].trim().split(/\s+/).filter((w) => !STOP.has(w))[0];
    if (tok) avoid.push(tok);
  }
  if (avoid.length) out.avoid = Array.from(new Set(avoid));

  // Must use: "use X", "with X", or bare noun mentions of common foods.
  const mustUse: string[] = [];
  for (const m of text.matchAll(/(?:use|using|with)\s+([a-z][a-z\s]{1,20})/g)) {
    const tok = m[1].trim().split(/\s+/).filter((w) => !STOP.has(w))[0];
    if (tok && !(out.avoid ?? []).includes(tok)) mustUse.push(tok);
  }
  const COMMON = ["chicken","beef","pork","salmon","tofu","pasta","rice","broccoli","spinach","eggs"];
  for (const c of COMMON) if (text.includes(c) && !mustUse.includes(c)) mustUse.push(c);
  if (mustUse.length) out.mustUse = Array.from(new Set(mustUse));

  return out;
}
