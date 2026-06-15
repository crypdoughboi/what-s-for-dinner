## Goal

Rebuild **What The Fridge?!** around a zero-typing dinner loop: **Capture → Decide → Cook → Update → Shop**. The deck is the homepage; AI is invisible plumbing that keeps inventory honest and ranks meals.

This is a presentation/logic rework of the existing frontend MVP. The current `src/routes/index.tsx` (~2.3k lines, 5 tabs, manual inventory-first) gets replaced by a four-tab shell built around the swipe deck. Existing Supabase schema (`inventory_items`, `meal_ideas`, `shopping_list_items`, etc.) is reused as-is; no migrations are needed for v1 since all new state (confidence, taste profile, capture batches) lives in client state with realistic simulated flows, matching the MVP brief.

## New navigation

Four tabs, bottom nav:

1. **Deck** — swipeable ranked meal cards (primary screen)
2. **Add** — capture-first entry
3. **Shop** — auto-regenerated list grouped by meals
4. **Kitchen** — inventory honesty view

Settings + Household move under a profile sheet on Kitchen header.
"Rescue" stops being a tab — expiring items boost ranking inside the deck.

## Screen-by-screen

### 1. Deck (default route `/`)
- Full-bleed stack of meal cards, Tinder-style. Top card shows hero photo, title, time/effort chips, "uses X expiring", missing-count badge, substitution notes inline.
- Gestures: swipe right = interested (+), left = not interested (−), up = save (+), tap "Cook" = strong + and enters cook mode.
- Sticky top: pill input **"Tell Tonight what you need."** Submitting reshuffles the deck (not a chat).
- Filter chips below input: Time (15/30/45+), Effort (easy/medium), Method (stovetop/oven/air fryer/sheet pan/no-cook), Vibe (cozy/light/indulgent/healthy).
- Empty state after last swipe: "Out of ideas — capture what's in your kitchen" → Add.

### 2. Add (capture-first)
Big tile grid in this priority order:
1. **Receipt photo** (camera/upload)
2. **Fridge photo**
3. **Grocery haul photo**
4. **Voice add** (mic)
5. **Paste receipt text**
6. **Manual add** (fallback, small link at bottom)

All six pipe into one **parser** that returns `{ name, qty, unit, category, location, confidence, expiresOn }[]`. Captured items land in a **Review batch**: tap any row to edit, swipe to drop, "Add N items" commits. Low-confidence rows are flagged amber; user taps to confirm.

### 3. Shop
- List auto-derived from: `saved meals + cooked queue − inventory(confirmed/probably) + staples`.
- Grouped by the meal that unlocks each ingredient ("Unlocks: Salmon Tacos").
- Quantity reconciliation (rough): "1 lb chicken (covers 2 meals)".
- Check items off; checked items pre-populate the next capture as confirmed inventory.
- Top action: "Regenerate from saved meals".

### 4. Kitchen (honesty view)
Items sectioned by state, not location:
- **Use soon** (expiring ≤3 days)
- **Confirmed have**
- **Probably have** (older than typical shelf life, no recent confirmation)
- **Running low** (post-cook inference)
- **Probably gone / Gone** (collapsed)

Each row shows a confidence dot. Tap → quick confirm/adjust/remove. Location filter chips at top.

## Core systems (client-side modules)

Place under `src/lib/kitchen/`:

- `parser.ts` — single entry `parseCapture(input: CaptureInput): ParsedItem[]`. `CaptureInput` is a discriminated union (`receipt_photo | fridge_photo | grocery_photo | voice | pasted_text | manual`). All six branches return the same normalized shape with `confidence: 0..1`. v1 uses curated simulated outputs keyed by capture type; the contract is real so a real model can drop in later.
- `shelf-life.ts` — table of `{ category, location } → days`. `predictExpiry(item)` returns an ISO date.
- `confidence.ts` — derives state (`confirmed_have | probably_have | running_low | use_soon | probably_gone | gone`) from `lastConfirmedAt`, predicted expiry, and post-cook decrements.
- `substitutions.ts` — bidirectional map plus compound subs (`buttermilk = milk + lemon`). `findSubs(missing, inventory)` returns viable swaps with notes.
- `ranker.ts` — pure function `rankMeals(meals, ctx)` scoring by: expiring-ingredient boost, owned-ingredient ratio, fewest missing purchases, taste profile dot-product, time/effort/method/vibe filters, substitution availability. Returns sorted with per-card "why this".
- `taste-profile.ts` — vector of tag weights (`spicy`, `pasta`, `sheet-pan`, `chicken`, …). `applySwipe(profile, meal, signal)` updates weights; `signal ∈ {interested, not_interested, saved, cooked, skipped}`.
- `cook-infer.ts` — `inferConsumption(meal, inventory)` returns `{ item, deltaQty, confidence }[]` for the post-cook confirm sheet.
- `constraint-parser.ts` — `parseConstraint(text)` → `{ servings?, maxMinutes?, mustUse[], avoid[], method?, vibe?, diet[] }`. Regex + keyword v1; pluggable.
- `shopping.ts` — `buildShoppingList(savedMeals, inventory, staples)` with meal grouping and rough qty reconciliation.

## State

One `KitchenStore` (Zustand or `useReducer` + context — Zustand preferred, already a small dep). Slices: `inventory`, `captureBatch`, `deck`, `taste`, `savedMeals`, `cookedQueue`, `shoppingChecked`, `filters`. Persisted to `localStorage` for the MVP; Supabase sync stays opt-in and out of scope for this rework.

## Files

Create:
- `src/lib/kitchen/{parser,shelf-life,confidence,substitutions,ranker,taste-profile,cook-infer,constraint-parser,shopping,types,seed}.ts`
- `src/lib/kitchen/store.ts` (Zustand)
- `src/components/deck/{MealDeck,MealCard,ConstraintBar,FilterChips}.tsx`
- `src/components/add/{CaptureGrid,ReviewBatch,CaptureSheet}.tsx`
- `src/components/kitchen/{InventoryList,ConfidenceDot,ItemSheet}.tsx`
- `src/components/shop/{ShoppingList,MealGroup}.tsx`
- `src/components/cook/CookSheet.tsx` (steps + Mark Cooked + post-cook confirm)
- `src/components/shell/{BottomNav,ProfileSheet}.tsx`
- `src/routes/{deck,add,shop,kitchen}.tsx` (route per tab; `index.tsx` redirects to `/deck`)

Edit:
- `src/routes/__root.tsx` — mount BottomNav
- `src/styles.css` — minor additions for swipe-card stack, confidence dots
- Remove the megafile body in `src/routes/index.tsx` (replaced by redirect)

Keep:
- Existing Supabase client, auth, theme tokens, food photography assets, button variants.

## Out of scope for this turn

- Real ML parsing — single-parser interface is real, outputs are curated.
- Cooking timers, recipe import, cookbook management.
- Real-time household sync (still single-user local state).
- DB schema changes — taste profile, capture batches, confidence states live in local store for v1.

## Verification

After build, drive the preview with Playwright: open `/`, confirm deck renders with cards, swipe right/left/up updates the next card, submitting the constraint pill reshuffles, Add tab shows the six capture tiles in order, Shop tab groups by meal, Kitchen tab shows state-based sections. Screenshot each tab.
