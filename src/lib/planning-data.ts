import gochujangImage from "@/assets/gochujang-bowls.jpg";
import salmonTacosImage from "@/assets/salmon-tacos.jpg";
import tomatoEggImage from "@/assets/tomato-egg-rice.jpg";

export type MealMode = "Before I Shop" | "Use What I Have" | "Use It Before It Goes Bad";
export type Difficulty = "Easy" | "Medium";

export type Meal = {
  id: string;
  title: string;
  description: string;
  whyThisWorks: string;
  timeMinutes: number;
  difficulty: Difficulty;
  cookingMethod: string;
  vibeTags: string[];
  dietaryTags: string[];
  servings: number;
  ingredientsHave: string[];
  ingredientsNeed: string[];
  expiringIngredientsUsed: string[];
  missingIngredientCount: number;
  steps: string[];
  substitutions: string[];
  image: string;
  modes: MealMode[];
};

export type GroceryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
  mealIds: string[];
  mealNames: string[];
  alreadyHave?: boolean;
};

export type KitchenItem = {
  id: string;
  name: string;
  quantity: string;
  location: "Fridge" | "Freezer" | "Pantry";
  category: string;
  expiration: string;
  status: "Fresh" | "Expiring soon" | "Expired";
  recentlyAdded: boolean;
  tags: string[];
};

const categoryByIngredient: Record<string, string> = {
  avocados: "Produce",
  broccoli: "Produce",
  cabbage: "Produce",
  cucumber: "Produce",
  kale: "Produce",
  lemons: "Produce",
  limes: "Produce",
  parsley: "Produce",
  "red onion": "Produce",
  scallions: "Produce",
  spinach: "Produce",
  tomatoes: "Produce",
  chicken: "Protein",
  "chicken thighs": "Protein",
  eggs: "Protein",
  "ground turkey": "Protein",
  salmon: "Protein",
  cheddar: "Dairy",
  "greek yogurt": "Dairy",
  butter: "Dairy",
  chickpeas: "Pantry",
  "coconut milk": "Pantry",
  "crispy garlic": "Pantry",
  gochujang: "Pantry",
  pitas: "Pantry",
  rice: "Pantry",
  tortillas: "Pantry",
  "udon noodles": "Pantry",
};

const quantityByIngredient: Record<string, { quantity: number; unit: string }> = {
  avocados: { quantity: 2, unit: "ct" },
  broccoli: { quantity: 1, unit: "head" },
  cabbage: { quantity: 1, unit: "bag" },
  cucumber: { quantity: 1, unit: "ct" },
  kale: { quantity: 1, unit: "bunch" },
  lemons: { quantity: 2, unit: "ct" },
  limes: { quantity: 4, unit: "ct" },
  parsley: { quantity: 1, unit: "bunch" },
  "red onion": { quantity: 1, unit: "ct" },
  scallions: { quantity: 1, unit: "bunch" },
  salmon: { quantity: 1, unit: "lb" },
  "ground turkey": { quantity: 1, unit: "lb" },
  cheddar: { quantity: 1, unit: "block" },
  "greek yogurt": { quantity: 1, unit: "tub" },
  chickpeas: { quantity: 2, unit: "cans" },
  pitas: { quantity: 1, unit: "pack" },
  tortillas: { quantity: 1, unit: "pack" },
};

export const meals: Meal[] = [
  {
    id: "sheet-pan-gochujang-chicken-bowls",
    title: "Sheet Pan Gochujang Chicken Bowls",
    description: "Sticky-spicy chicken, broccoli, and rice with a bright finish.",
    whyThisWorks: "Uses chicken thighs before they expire and turns pantry rice into a full meal.",
    timeMinutes: 35,
    difficulty: "Easy",
    cookingMethod: "Sheet pan",
    vibeTags: ["spicy", "weeknight", "high-protein"],
    dietaryTags: ["dairy-free"],
    servings: 2,
    ingredientsHave: ["chicken thighs", "rice", "gochujang"],
    ingredientsNeed: ["broccoli", "scallions", "cucumber"],
    expiringIngredientsUsed: ["chicken thighs"],
    missingIngredientCount: 3,
    steps: [
      "Coat chicken with gochujang, oil, garlic, and a little soy sauce.",
      "Roast with broccoli until the chicken is browned and cooked through.",
      "Warm rice and slice cucumber and scallions.",
      "Serve bowls with pan juices and a squeeze of lime or lemon.",
    ],
    substitutions: [
      "Use cauliflower or green beans instead of broccoli.",
      "Swap rice for noodles.",
    ],
    image: gochujangImage,
    modes: ["Before I Shop", "Use What I Have", "Use It Before It Goes Bad"],
  },
  {
    id: "air-fryer-salmon-tacos",
    title: "Air Fryer Salmon Tacos",
    description: "Crisp-edged salmon, creamy yogurt sauce, cabbage, and lime.",
    whyThisWorks: "You already have tortillas and yogurt, so the list stays short.",
    timeMinutes: 25,
    difficulty: "Easy",
    cookingMethod: "Air fryer",
    vibeTags: ["fresh", "quick", "bright"],
    dietaryTags: ["pescatarian"],
    servings: 2,
    ingredientsHave: ["tortillas", "Greek yogurt", "avocados", "lemons"],
    ingredientsNeed: ["salmon", "cabbage", "limes"],
    expiringIngredientsUsed: ["Greek yogurt"],
    missingIngredientCount: 3,
    steps: [
      "Season salmon with chili powder, salt, and oil.",
      "Air fry until browned at the edges and flaky in the center.",
      "Stir Greek yogurt with lime, salt, and a little hot sauce.",
      "Fill warm tortillas with salmon, cabbage, avocado, and sauce.",
    ],
    substitutions: ["Use shrimp or white fish instead of salmon.", "Use bagged slaw for cabbage."],
    image: salmonTacosImage,
    modes: ["Before I Shop", "Use It Before It Goes Bad"],
  },
  {
    id: "cozy-tomato-egg-rice",
    title: "Cozy Tomato Egg Rice",
    description: "Jammy tomato rice with soft eggs and garlicky greens.",
    whyThisWorks: "A low-effort dinner built from eggs, rice, tomato paste, and spinach.",
    timeMinutes: 20,
    difficulty: "Easy",
    cookingMethod: "Stovetop",
    vibeTags: ["cozy", "cheap", "fast"],
    dietaryTags: ["vegetarian"],
    servings: 2,
    ingredientsHave: ["eggs", "rice", "spinach", "tomato paste"],
    ingredientsNeed: ["scallions"],
    expiringIngredientsUsed: ["spinach"],
    missingIngredientCount: 1,
    steps: [
      "Cook tomato paste and garlic in oil until it darkens slightly.",
      "Add rice and a splash of water, then fold in spinach until wilted.",
      "Make wells and crack in eggs.",
      "Cover until the whites set, then finish with scallions.",
    ],
    substitutions: ["Use kale instead of spinach.", "Add chili crisp if you have it."],
    image: tomatoEggImage,
    modes: ["Use What I Have", "Use It Before It Goes Bad"],
  },
  {
    id: "pantry-pasta-crispy-garlic",
    title: "Pantry Pasta with Crispy Garlic",
    description: "Tomatoey pasta with golden garlic, a little heat, and cheddar on top.",
    whyThisWorks: "It uses shelf-stable staples and does not require a grocery run.",
    timeMinutes: 22,
    difficulty: "Easy",
    cookingMethod: "One pot",
    vibeTags: ["pantry", "cheap", "comfort"],
    dietaryTags: ["vegetarian"],
    servings: 2,
    ingredientsHave: ["pasta", "tomato paste", "garlic", "cheddar"],
    ingredientsNeed: [],
    expiringIngredientsUsed: [],
    missingIngredientCount: 0,
    steps: [
      "Cook pasta until just shy of done and save a mug of pasta water.",
      "Crisp sliced garlic in oil, then stir in tomato paste and chili flakes.",
      "Toss pasta with the sauce and pasta water until glossy.",
      "Finish with cheddar and black pepper.",
    ],
    substitutions: ["Use parmesan if you have it.", "Add spinach at the end."],
    image: tomatoEggImage,
    modes: ["Use What I Have"],
  },
  {
    id: "freezer-dumpling-soup",
    title: "Freezer Dumpling Soup",
    description: "Brothy dumplings with greens, scallions, and a soft egg.",
    whyThisWorks: "A freezer backup becomes a real dinner with one fresh green.",
    timeMinutes: 18,
    difficulty: "Easy",
    cookingMethod: "Stovetop",
    vibeTags: ["fast", "cozy", "freezer"],
    dietaryTags: [],
    servings: 2,
    ingredientsHave: ["frozen dumplings", "eggs", "spinach"],
    ingredientsNeed: ["scallions", "coconut milk"],
    expiringIngredientsUsed: ["spinach"],
    missingIngredientCount: 2,
    steps: [
      "Simmer broth with ginger, garlic, and a splash of soy sauce.",
      "Add dumplings and cook until tender.",
      "Stir in spinach and coconut milk if using.",
      "Top with scallions and a soft egg.",
    ],
    substitutions: [
      "Skip coconut milk for a lighter broth.",
      "Use udon if you are low on dumplings.",
    ],
    image: tomatoEggImage,
    modes: ["Before I Shop", "Use What I Have", "Use It Before It Goes Bad"],
  },
  {
    id: "big-chopped-sandwich-salad",
    title: "Big Chopped Sandwich Salad",
    description: "Crunchy lettuce, chickpeas, cheddar, pickles, and creamy yogurt dressing.",
    whyThisWorks: "It uses Greek yogurt and turns odds and ends into lunch or dinner.",
    timeMinutes: 15,
    difficulty: "Easy",
    cookingMethod: "No cook",
    vibeTags: ["crunchy", "lunch", "fresh"],
    dietaryTags: ["vegetarian"],
    servings: 2,
    ingredientsHave: ["Greek yogurt", "cheddar", "pickles"],
    ingredientsNeed: ["cucumber", "red onion", "chickpeas"],
    expiringIngredientsUsed: ["Greek yogurt"],
    missingIngredientCount: 3,
    steps: [
      "Chop everything small so each bite gets a little of everything.",
      "Whisk Greek yogurt with pickle brine, mustard, salt, and pepper.",
      "Toss vegetables, chickpeas, cheddar, and dressing.",
      "Eat as a salad or pile into toasted bread.",
    ],
    substitutions: ["Use white beans instead of chickpeas.", "Add turkey if you want protein."],
    image: salmonTacosImage,
    modes: ["Before I Shop", "Use It Before It Goes Bad"],
  },
  {
    id: "turkey-taco-rice-bowls",
    title: "Turkey Taco Rice Bowls",
    description: "Seasoned turkey over rice with avocado, lime, and crunchy toppings.",
    whyThisWorks: "A flexible meal prep dinner that shares ingredients with tacos and salads.",
    timeMinutes: 30,
    difficulty: "Easy",
    cookingMethod: "Skillet",
    vibeTags: ["meal prep", "high-protein", "family"],
    dietaryTags: ["gluten-free"],
    servings: 3,
    ingredientsHave: ["rice", "gochujang"],
    ingredientsNeed: ["ground turkey", "avocados", "limes", "scallions"],
    expiringIngredientsUsed: [],
    missingIngredientCount: 4,
    steps: [
      "Brown turkey in a skillet with taco seasoning.",
      "Warm rice and season with lime and salt.",
      "Slice avocado and scallions.",
      "Build bowls with turkey, rice, avocado, and any hot sauce you like.",
    ],
    substitutions: ["Use black beans for a vegetarian version.", "Use tortillas instead of rice."],
    image: gochujangImage,
    modes: ["Before I Shop"],
  },
  {
    id: "lemon-chicken-pitas",
    title: "Lemon Chicken Pitas",
    description: "Warm pitas with chicken, cucumber, yogurt sauce, and herbs.",
    whyThisWorks: "It rescues chicken and yogurt while still feeling fresh.",
    timeMinutes: 28,
    difficulty: "Easy",
    cookingMethod: "Skillet",
    vibeTags: ["fresh", "quick", "high-protein"],
    dietaryTags: [],
    servings: 2,
    ingredientsHave: ["chicken thighs", "Greek yogurt", "lemons"],
    ingredientsNeed: ["pitas", "cucumber", "parsley"],
    expiringIngredientsUsed: ["chicken thighs", "Greek yogurt"],
    missingIngredientCount: 3,
    steps: [
      "Season chicken with lemon, garlic, oregano, salt, and oil.",
      "Sear until browned and cooked through.",
      "Stir yogurt with lemon, salt, and grated garlic.",
      "Stuff pitas with chicken, cucumber, herbs, and sauce.",
    ],
    substitutions: ["Use tortillas instead of pitas.", "Use dill or scallions instead of parsley."],
    image: gochujangImage,
    modes: ["Before I Shop", "Use It Before It Goes Bad"],
  },
  {
    id: "broccoli-cheddar-baked-potatoes",
    title: "Broccoli Cheddar Baked Potatoes",
    description: "Crisp-skinned potatoes loaded with broccoli and sharp cheddar.",
    whyThisWorks: "A comfort dinner with a small produce list and pantry-friendly ingredients.",
    timeMinutes: 45,
    difficulty: "Medium",
    cookingMethod: "Oven",
    vibeTags: ["comfort", "vegetarian", "cozy"],
    dietaryTags: ["vegetarian", "gluten-free"],
    servings: 2,
    ingredientsHave: ["cheddar", "butter"],
    ingredientsNeed: ["broccoli", "potatoes", "Greek yogurt"],
    expiringIngredientsUsed: [],
    missingIngredientCount: 3,
    steps: [
      "Bake potatoes until the skins are crisp and centers are soft.",
      "Steam or roast broccoli until tender.",
      "Split potatoes and add butter, cheddar, broccoli, and yogurt.",
      "Finish with pepper and a pinch of salt.",
    ],
    substitutions: ["Use sour cream instead of yogurt.", "Add chickpeas for more protein."],
    image: tomatoEggImage,
    modes: ["Before I Shop"],
  },
  {
    id: "crispy-chickpea-pita-plates",
    title: "Crispy Chickpea Pita Plates",
    description: "Spiced chickpeas, cool yogurt, cucumber, and warm pitas.",
    whyThisWorks: "It is cheap, quick, and built around pantry chickpeas.",
    timeMinutes: 25,
    difficulty: "Easy",
    cookingMethod: "Skillet",
    vibeTags: ["cheap", "crunchy", "vegetarian"],
    dietaryTags: ["vegetarian"],
    servings: 2,
    ingredientsHave: ["Greek yogurt", "lemons"],
    ingredientsNeed: ["chickpeas", "pitas", "cucumber", "parsley"],
    expiringIngredientsUsed: ["Greek yogurt"],
    missingIngredientCount: 4,
    steps: [
      "Dry chickpeas well and crisp them in a skillet with oil and spices.",
      "Stir yogurt with lemon, garlic, salt, and pepper.",
      "Slice cucumber and warm pitas.",
      "Serve chickpeas with yogurt sauce, cucumber, herbs, and lemon.",
    ],
    substitutions: ["Use tortillas if you do not have pitas.", "Add avocado if you have one."],
    image: salmonTacosImage,
    modes: ["Before I Shop", "Use It Before It Goes Bad"],
  },
];

export const kitchenSeed: KitchenItem[] = [
  {
    id: "spinach",
    name: "Spinach",
    quantity: "1 bag",
    location: "Fridge",
    category: "Produce",
    expiration: "Tomorrow",
    status: "Expiring soon",
    recentlyAdded: false,
    tags: ["greens", "use first"],
  },
  {
    id: "greek-yogurt",
    name: "Greek yogurt",
    quantity: "3/4 tub",
    location: "Fridge",
    category: "Dairy",
    expiration: "2 days",
    status: "Expiring soon",
    recentlyAdded: false,
    tags: ["sauce", "breakfast"],
  },
  {
    id: "chicken-thighs",
    name: "Chicken thighs",
    quantity: "4 pieces",
    location: "Fridge",
    category: "Protein",
    expiration: "3 days",
    status: "Expiring soon",
    recentlyAdded: true,
    tags: ["dinner"],
  },
  {
    id: "strawberries",
    name: "Strawberries",
    quantity: "1 pint",
    location: "Fridge",
    category: "Produce",
    expiration: "4 days",
    status: "Fresh",
    recentlyAdded: true,
    tags: ["snack"],
  },
  {
    id: "eggs",
    name: "Eggs",
    quantity: "10",
    location: "Fridge",
    category: "Protein",
    expiration: "9 days",
    status: "Fresh",
    recentlyAdded: false,
    tags: ["breakfast", "dinner"],
  },
  {
    id: "frozen-rice",
    name: "Frozen rice",
    quantity: "2 packs",
    location: "Freezer",
    category: "Pantry",
    expiration: "3 months",
    status: "Fresh",
    recentlyAdded: false,
    tags: ["quick"],
  },
  {
    id: "pasta",
    name: "Pasta",
    quantity: "1 box",
    location: "Pantry",
    category: "Pantry",
    expiration: "8 months",
    status: "Fresh",
    recentlyAdded: false,
    tags: ["pantry"],
  },
  {
    id: "old-cilantro",
    name: "Cilantro",
    quantity: "small bunch",
    location: "Fridge",
    category: "Produce",
    expiration: "Yesterday",
    status: "Expired",
    recentlyAdded: false,
    tags: ["herbs"],
  },
];

export const grocerySeed: GroceryItem[] = [
  makeGroceryItem(
    "broccoli",
    "Produce",
    1,
    "head",
    "Sheet Pan Gochujang Chicken Bowls",
    "sheet-pan-gochujang-chicken-bowls",
  ),
  makeGroceryItem(
    "scallions",
    "Produce",
    1,
    "bunch",
    "Sheet Pan Gochujang Chicken Bowls",
    "sheet-pan-gochujang-chicken-bowls",
  ),
  makeGroceryItem(
    "cucumber",
    "Produce",
    1,
    "ct",
    "Sheet Pan Gochujang Chicken Bowls",
    "sheet-pan-gochujang-chicken-bowls",
  ),
  makeGroceryItem("limes", "Produce", 4, "ct", "Air Fryer Salmon Tacos", "air-fryer-salmon-tacos"),
  makeGroceryItem(
    "avocados",
    "Produce",
    2,
    "ct",
    "Turkey Taco Rice Bowls",
    "turkey-taco-rice-bowls",
  ),
  makeGroceryItem("salmon", "Protein", 1, "lb", "Air Fryer Salmon Tacos", "air-fryer-salmon-tacos"),
  makeGroceryItem(
    "ground turkey",
    "Protein",
    1,
    "lb",
    "Turkey Taco Rice Bowls",
    "turkey-taco-rice-bowls",
  ),
  makeGroceryItem(
    "Greek yogurt",
    "Dairy",
    1,
    "tub",
    "Crispy Chickpea Pita Plates",
    "crispy-chickpea-pita-plates",
  ),
  makeGroceryItem(
    "cheddar",
    "Dairy",
    1,
    "block",
    "Broccoli Cheddar Baked Potatoes",
    "broccoli-cheddar-baked-potatoes",
  ),
  makeGroceryItem(
    "tortillas",
    "Pantry",
    1,
    "pack",
    "Air Fryer Salmon Tacos",
    "air-fryer-salmon-tacos",
  ),
  makeGroceryItem("rice", "Pantry", 1, "bag", "Turkey Taco Rice Bowls", "turkey-taco-rice-bowls"),
  makeGroceryItem(
    "chickpeas",
    "Pantry",
    2,
    "cans",
    "Crispy Chickpea Pita Plates",
    "crispy-chickpea-pita-plates",
  ),
  makeGroceryItem("pitas", "Pantry", 1, "pack", "Lemon Chicken Pitas", "lemon-chicken-pitas"),
  makeGroceryItem(
    "cabbage",
    "Produce",
    1,
    "bag",
    "Air Fryer Salmon Tacos",
    "air-fryer-salmon-tacos",
  ),
];

export function normalizeIngredientName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

export function addMissingIngredientsToList(list: GroceryItem[], meal: Meal) {
  let addedCount = 0;

  const next = meal.ingredientsNeed.reduce<GroceryItem[]>((items, ingredient) => {
    const normalized = normalizeIngredientName(ingredient);
    const existingIndex = items.findIndex(
      (item) => normalizeIngredientName(item.name) === normalized,
    );

    if (existingIndex >= 0) {
      return items.map((item, index) => {
        if (index !== existingIndex) return item;

        return {
          ...item,
          mealIds: item.mealIds.includes(meal.id) ? item.mealIds : [...item.mealIds, meal.id],
          mealNames: item.mealNames.includes(meal.title)
            ? item.mealNames
            : [...item.mealNames, meal.title],
        };
      });
    }

    addedCount += 1;
    const quantity = quantityByIngredient[normalized] ?? { quantity: 1, unit: "item" };

    return [
      ...items,
      {
        id: `${normalized.replace(/\s+/g, "-")}-${meal.id}`,
        name: ingredient,
        category: categoryByIngredient[normalized] ?? "Other",
        quantity: quantity.quantity,
        unit: quantity.unit,
        checked: false,
        mealIds: [meal.id],
        mealNames: [meal.title],
      },
    ];
  }, list);

  return { items: next, addedCount };
}

export function groupGroceryItemsByCategory(items: GroceryItem[]) {
  return items.reduce<Record<string, GroceryItem[]>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item];
    return groups;
  }, {});
}

export function getMealMatchReason(meal: Meal) {
  if (meal.expiringIngredientsUsed.length > 0) {
    return `Uses ${meal.expiringIngredientsUsed.join(", ")} before it goes bad.`;
  }

  if (meal.ingredientsNeed.length === 0) {
    return "You already have everything for this.";
  }

  return meal.whyThisWorks;
}

export function getExpiringItems(items: KitchenItem[]) {
  return items.filter((item) => item.status === "Expiring soon");
}

export function calculateCheckedProgress(items: GroceryItem[]) {
  return {
    checked: items.filter((item) => item.checked).length,
    total: items.length,
  };
}

export function filterMealsForMode(mode: MealMode, skippedMealIds: string[]) {
  return meals.filter((meal) => meal.modes.includes(mode) && !skippedMealIds.includes(meal.id));
}

export function createKitchenItemFromGrocery(
  item: GroceryItem,
  location: KitchenItem["location"],
  expiration: string,
): KitchenItem {
  return {
    id: `kitchen-${normalizeIngredientName(item.name).replace(/\s+/g, "-")}-${Date.now()}`,
    name: item.name,
    quantity: `${item.quantity} ${item.unit}`,
    location,
    category: item.category,
    expiration,
    status: "Fresh",
    recentlyAdded: true,
    tags: item.mealNames.length > 0 ? ["planned meal"] : ["shopping"],
  };
}

function makeGroceryItem(
  name: string,
  category: string,
  quantity: number,
  unit: string,
  mealName: string,
  mealId: string,
): GroceryItem {
  return {
    id: `${normalizeIngredientName(name).replace(/\s+/g, "-")}-${mealId}`,
    name,
    category,
    quantity,
    unit,
    checked: false,
    mealIds: [mealId],
    mealNames: [mealName],
  };
}
