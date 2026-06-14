import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Apple,
  Archive,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  CirclePlus,
  Clock3,
  CookingPot,
  Edit3,
  Heart,
  Leaf,
  ListChecks,
  Menu,
  Mic,
  Minus,
  PackageOpen,
  Plus,
  Refrigerator,
  ScanLine,
  Search,
  Settings,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Store,
  Sun,
  Trash2,
  UserRound,
  UsersRound,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { lovable } from "@/integrations/lovable";
import {
  addMissingIngredientsToList,
  calculateCheckedProgress,
  createKitchenItemFromGrocery,
  filterMealsForMode,
  getExpiringItems,
  getMealMatchReason,
  grocerySeed,
  groupGroceryItemsByCategory,
  kitchenSeed,
  meals,
  normalizeIngredientName,
  type GroceryItem,
  type KitchenItem,
  type Meal,
  type MealMode,
} from "@/lib/planning-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "What The Fridge?! - Plan Meals, Shop Smarter" },
      {
        name: "description",
        content:
          "Plan meals, build your grocery list, track what is in your kitchen, and waste less food.",
      },
      { property: "og:title", content: "What The Fridge?!" },
      {
        property: "og:description",
        content: "Plan meals, build your grocery list, and use what is already in your kitchen.",
      },
    ],
  }),
  component: Index,
});

type Tab = "plan" | "meals" | "list" | "kitchen" | "household";
type MealViewMode = MealMode | "Liked Meals";
type ModalState = "add" | "voice" | "receipt" | "barcode" | "auth" | "settings" | null;
type KitchenFilter =
  | "All"
  | "Fridge"
  | "Freezer"
  | "Pantry"
  | "Expiring soon"
  | "Expired"
  | "Recently added";

const mealModes: MealViewMode[] = [
  "Before I Shop",
  "Use What I Have",
  "Use It Before It Goes Bad",
  "Liked Meals",
];

const modeCopy: Record<MealViewMode, string> = {
  "Before I Shop": "Get ideas first, then turn missing ingredients into a list.",
  "Use What I Have": "Start with your kitchen and keep the grocery list short.",
  "Use It Before It Goes Bad": "Prioritize food with a deadline.",
  "Liked Meals": "Saved ideas you can cook later or shop for now.",
};

function Index() {
  const [tab, setTab] = useState<Tab>("plan");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [dark, setDark] = useState(false);
  const [likedMealIds, setLikedMealIds] = useState<string[]>([]);
  const [skippedMealIds, setSkippedMealIds] = useState<Record<MealMode, string[]>>({
    "Before I Shop": [],
    "Use What I Have": [],
    "Use It Before It Goes Bad": [],
  });
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [selectedMealMode, setSelectedMealMode] = useState<MealViewMode>("Before I Shop");
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(grocerySeed);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>(kitchenSeed);
  const [search, setSearch] = useState("");
  const [kitchenFilter, setKitchenFilter] = useState<KitchenFilter>("All");
  const [shopModeOpen, setShopModeOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("what-the-fridge-liked-meals");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setLikedMealIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      window.localStorage.removeItem("what-the-fridge-liked-meals");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("what-the-fridge-liked-meals", JSON.stringify(likedMealIds));
  }, [likedMealIds]);

  useEffect(() => {
    setActiveMealIndex(0);
  }, [selectedMealMode]);

  const visibleKitchenItems = useMemo(() => {
    return kitchenItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (kitchenFilter === "All") return true;
      if (kitchenFilter === "Expiring soon") return item.status === "Expiring soon";
      if (kitchenFilter === "Expired") return item.status === "Expired";
      if (kitchenFilter === "Recently added") return item.recentlyAdded;
      return item.location === kitchenFilter;
    });
  }, [kitchenFilter, kitchenItems, search]);

  const openAdd = (kind: ModalState = "add") => setModal(kind);

  const addMissing = (meal: Meal, goToList = true) => {
    let addedCount = 0;
    setGroceryItems((prev) => {
      const result = addMissingIngredientsToList(prev, meal);
      addedCount = result.addedCount;
      return result.items;
    });

    toast.success(
      addedCount > 0
        ? "Added missing ingredients to your List"
        : "Those ingredients are already on your List",
    );

    if (goToList) {
      setTab("list");
    }
    setSelectedMeal(null);
  };

  const toggleLike = (meal: Meal, showConfirmation = true) => {
    setLikedMealIds((current) => {
      if (current.includes(meal.id)) {
        return current.filter((id) => id !== meal.id);
      }

      if (showConfirmation) {
        toast.success("Saved to Liked Meals");
      }
      return [...current, meal.id];
    });
  };

  const likeFromSwipe = (meal: Meal) => {
    setLikedMealIds((current) => {
      if (current.includes(meal.id)) return current;
      toast.success("Saved to Liked Meals");
      return [...current, meal.id];
    });
  };

  const skipMeal = (meal: Meal) => {
    if (selectedMealMode === "Liked Meals") return;

    setSkippedMealIds((current) => ({
      ...current,
      [selectedMealMode]: current[selectedMealMode].includes(meal.id)
        ? current[selectedMealMode]
        : [...current[selectedMealMode], meal.id],
    }));
  };

  const moveCheckedToKitchen = (location: KitchenItem["location"], expiration: string) => {
    const checkedItems = groceryItems.filter((item) => item.checked);
    if (checkedItems.length === 0) return;

    setKitchenItems((current) => [
      ...checkedItems.map((item) => createKitchenItemFromGrocery(item, location, expiration)),
      ...current,
    ]);
    setGroceryItems((current) => current.filter((item) => !item.checked));
    setMoveDialogOpen(false);
    setTab("kitchen");
    toast.success("Moved checked items to Kitchen");
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
            <button
              onClick={() => setTab("plan")}
              className="flex min-w-0 items-center gap-2 text-left"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-kitchen">
                <Refrigerator className="size-5" />
              </span>
              <span className="truncate font-display text-lg font-bold tracking-tight">
                What The Fridge?
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setDark((value) => !value)}
              >
                <Sun />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                onClick={() => setModal("settings")}
              >
                <Settings />
              </Button>
              <Button variant="cream" size="sm" onClick={() => setModal("auth")}>
                <UserRound /> <span className="hidden sm:inline">Sign in</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12">
          {tab === "plan" && (
            <PlanScreen
              groceryItems={groceryItems}
              kitchenItems={kitchenItems}
              setTab={setTab}
              openAdd={openAdd}
              openMeal={setSelectedMeal}
              setSelectedMealMode={setSelectedMealMode}
              openShopMode={() => {
                setTab("list");
                setShopModeOpen(true);
              }}
            />
          )}
          {tab === "meals" && (
            <MealsScreen
              selectedMealMode={selectedMealMode}
              setSelectedMealMode={setSelectedMealMode}
              likedMealIds={likedMealIds}
              skippedMealIds={skippedMealIds}
              activeMealIndex={activeMealIndex}
              setActiveMealIndex={setActiveMealIndex}
              openMeal={setSelectedMeal}
              addMissing={addMissing}
              toggleLike={toggleLike}
              likeFromSwipe={likeFromSwipe}
              skipMeal={skipMeal}
            />
          )}
          {tab === "list" && (
            <ListScreen
              groceryItems={groceryItems}
              setGroceryItems={setGroceryItems}
              setTab={setTab}
              setSelectedMealMode={setSelectedMealMode}
              openShopMode={() => setShopModeOpen(true)}
              openMoveDialog={() => setMoveDialogOpen(true)}
            />
          )}
          {tab === "kitchen" && (
            <KitchenScreen
              search={search}
              setSearch={setSearch}
              filter={kitchenFilter}
              setFilter={setKitchenFilter}
              items={visibleKitchenItems}
              allItems={kitchenItems}
              openAdd={openAdd}
            />
          )}
          {tab === "household" && <HouseholdScreen setModal={setModal} />}
        </main>

        <BottomNav tab={tab} setTab={setTab} />

        <MealDialog
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onAdd={addMissing}
          saved={selectedMeal ? likedMealIds.includes(selectedMeal.id) : false}
          onSave={() => selectedMeal && toggleLike(selectedMeal)}
        />
        <ShopMode
          open={shopModeOpen}
          onOpenChange={setShopModeOpen}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryItems}
        />
        <MoveToKitchenDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          checkedCount={groceryItems.filter((item) => item.checked).length}
          onMove={moveCheckedToKitchen}
        />
        <FlowDialog modal={modal} setModal={setModal} />
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: Dispatch<SetStateAction<Tab>> }) {
  const nav = [
    ["plan", CalendarDays, "Plan"],
    ["meals", ChefHat, "Meals"],
    ["list", ShoppingBasket, "List"],
    ["kitchen", Refrigerator, "Kitchen"],
    ["household", UsersRound, "Household"],
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:sticky sm:mx-auto sm:mb-5 sm:w-fit sm:rounded-full sm:border sm:px-3 sm:shadow-kitchen">
      <div className="mx-auto flex max-w-xl justify-around gap-1">
        {nav.map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all sm:min-w-20 ${
              tab === id ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function PlanScreen({
  groceryItems,
  kitchenItems,
  setTab,
  openAdd,
  openMeal,
  setSelectedMealMode,
  openShopMode,
}: {
  groceryItems: GroceryItem[];
  kitchenItems: KitchenItem[];
  setTab: Dispatch<SetStateAction<Tab>>;
  openAdd: (m?: ModalState) => void;
  openMeal: (meal: Meal) => void;
  setSelectedMealMode: Dispatch<SetStateAction<MealViewMode>>;
  openShopMode: () => void;
}) {
  const expiringItems = getExpiringItems(kitchenItems);
  const plannedMealIds = new Set(groceryItems.flatMap((item) => item.mealIds));
  const plannedMeals = meals.filter((meal) => plannedMealIds.has(meal.id));
  const alreadyHaveCount = plannedMeals
    .flatMap((meal) => meal.ingredientsHave)
    .filter((name, index, all) => all.indexOf(name) === index).length;

  const startMealMode = (mode: MealMode) => {
    setSelectedMealMode(mode);
    setTab("meals");
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">Plan dinner, then shop.</p>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
            What are we eating?
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Pick meals, build your grocery list, and use what&apos;s already in your kitchen.
          </p>
        </div>
        <GroceryPreviewCard
          itemCount={groceryItems.length}
          mealCount={plannedMealIds.size}
          alreadyHaveCount={alreadyHaveCount || 4}
          setTab={setTab}
          openMealIdeas={() => startMealMode("Before I Shop")}
          openShopMode={openShopMode}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <PlanActionCard
          icon={ShoppingBasket}
          title="Plan my groceries"
          description="Get meal ideas and turn them into a grocery list before you shop."
          onClick={() => startMealMode("Before I Shop")}
        />
        <PlanActionCard
          icon={CookingPot}
          title="Make dinner tonight"
          description="Find one good meal based on your time, mood, and what you have."
          onClick={() => startMealMode("Use What I Have")}
          warm
        />
        <PlanActionCard
          icon={Clock3}
          title="Use what I have"
          description="Cook with your fridge, freezer, pantry, and expiring food."
          onClick={() => startMealMode("Use It Before It Goes Bad")}
        />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat value={String(kitchenItems.length)} label="items in Kitchen" />
        <Stat value={String(expiringItems.length)} label="use soon" warm />
        <Stat value={String(meals.length)} label="meal ideas" />
      </section>

      <section>
        <SectionTitle
          eyebrow="Use these first"
          title="Good food on a deadline"
          action={
            <button onClick={() => setTab("kitchen")} className="text-sm font-bold text-primary">
              See Kitchen
            </button>
          }
        />
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {expiringItems.map((item) => (
            <div key={item.id} className="app-card min-w-44 p-4">
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
                <Clock3 className="size-5" />
              </span>
              <b className="mt-3 block">{item.name}</b>
              <span className="text-xs font-bold text-primary">Use in {item.expiration}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.quantity} in {item.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Smart matches"
          title="Meals that use what is expiring"
          action={
            <button
              onClick={() => startMealMode("Use It Before It Goes Bad")}
              className="text-sm font-bold text-primary"
            >
              More ideas
            </button>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {meals
            .filter((meal) => meal.expiringIngredientsUsed.length > 0)
            .slice(0, 3)
            .map((meal) => (
              <MealCard key={meal.id} meal={meal} onClick={() => openMeal(meal)} compact />
            ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Add food, your way" />
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              [Mic, "Voice", "voice", "Say what should go to Kitchen or List."],
              [Camera, "Receipt", "receipt", "Add purchased groceries to Kitchen."],
              [ScanLine, "Barcode", "barcode", "Add packaged food to Kitchen or List."],
              [CirclePlus, "Manual", "add", "Add one item or a quick batch."],
            ] as const
          ).map(([Icon, label, key, description]) => (
            <button
              key={label}
              onClick={() => openAdd(key)}
              className="app-card flex flex-col items-center gap-2 px-2 py-4 text-center text-xs font-bold transition-transform hover:-translate-y-1"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              {label}
              <span className="hidden px-1 text-[11px] font-medium text-muted-foreground sm:block">
                {description}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  warm,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  warm?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group app-card min-h-40 p-5 text-left transition-transform hover:-translate-y-1 ${
        warm ? "bg-primary text-primary-foreground" : ""
      }`}
    >
      <span
        className={`mb-5 grid size-11 place-items-center rounded-2xl ${
          warm ? "bg-background/20" : "bg-secondary text-primary"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <b className="block text-lg">{title}</b>
      <span className={`mt-2 block text-sm ${warm ? "opacity-80" : "text-muted-foreground"}`}>
        {description}
      </span>
    </button>
  );
}

function GroceryPreviewCard({
  itemCount,
  mealCount,
  alreadyHaveCount,
  setTab,
  openMealIdeas,
  openShopMode,
}: {
  itemCount: number;
  mealCount: number;
  alreadyHaveCount: number;
  setTab: Dispatch<SetStateAction<Tab>>;
  openMealIdeas: () => void;
  openShopMode: () => void;
}) {
  return (
    <div className="app-card bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Your next grocery list
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">Shop with meals in mind</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mealCount || 3} meals planned · {itemCount} items · {alreadyHaveCount} things you
            already have
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage text-sage-foreground">
          <ListChecks className="size-5" />
        </span>
      </div>
      <div className="mt-5 grid gap-2">
        <Button variant="kitchen" size="kitchen" onClick={() => setTab("list")}>
          <ShoppingBasket /> View list
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="cream" size="kitchen" onClick={openMealIdeas}>
            <Sparkles /> Add meal ideas
          </Button>
          <Button variant="dark" size="kitchen" onClick={openShopMode}>
            <Store /> Shop mode
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, warm }: { value: string; label: string; warm?: boolean }) {
  return (
    <div
      className={`rounded-[1.4rem] p-4 ${
        warm ? "bg-secondary text-secondary-foreground" : "app-card"
      }`}
    >
      <b className="font-display text-2xl sm:text-3xl">{value}</b>
      <span className="mt-1 block text-[11px] font-semibold text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function MealsScreen({
  selectedMealMode,
  setSelectedMealMode,
  likedMealIds,
  skippedMealIds,
  activeMealIndex,
  setActiveMealIndex,
  openMeal,
  addMissing,
  toggleLike,
  likeFromSwipe,
  skipMeal,
}: {
  selectedMealMode: MealViewMode;
  setSelectedMealMode: Dispatch<SetStateAction<MealViewMode>>;
  likedMealIds: string[];
  skippedMealIds: Record<MealMode, string[]>;
  activeMealIndex: number;
  setActiveMealIndex: Dispatch<SetStateAction<number>>;
  openMeal: (meal: Meal) => void;
  addMissing: (meal: Meal, goToList?: boolean) => void;
  toggleLike: (meal: Meal, showConfirmation?: boolean) => void;
  likeFromSwipe: (meal: Meal) => void;
  skipMeal: (meal: Meal) => void;
}) {
  const activeMeals = useMemo(() => {
    if (selectedMealMode === "Liked Meals") return [];
    return filterMealsForMode(selectedMealMode, skippedMealIds[selectedMealMode]).filter(
      (meal) => !likedMealIds.includes(meal.id),
    );
  }, [likedMealIds, selectedMealMode, skippedMealIds]);

  const currentMeal = activeMeals[activeMealIndex] ?? activeMeals[0];
  const nextMeals = activeMeals.slice(activeMealIndex + 1, activeMealIndex + 3);
  const likedMeals = meals.filter((meal) => likedMealIds.includes(meal.id));

  useEffect(() => {
    if (selectedMealMode !== "Liked Meals" && activeMealIndex >= activeMeals.length) {
      setActiveMealIndex(Math.max(activeMeals.length - 1, 0));
    }
  }, [activeMealIndex, activeMeals.length, selectedMealMode, setActiveMealIndex]);

  const finishCard = (meal: Meal, action: "like" | "skip") => {
    if (action === "like") {
      likeFromSwipe(meal);
    } else {
      skipMeal(meal);
    }
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="mb-2 text-sm font-bold text-primary">Meal ideas</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Find the next good meal</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Swipe through practical ideas, save the ones that sound right, then add the missing
          ingredients to your List.
        </p>
      </section>

      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
        {mealModes.map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMealMode(mode)}
            className={`min-w-56 rounded-[1.5rem] border p-4 text-left transition-all ${
              selectedMealMode === mode
                ? "border-primary bg-primary text-primary-foreground shadow-kitchen"
                : "border-border bg-card"
            }`}
          >
            <ModeIcon mode={mode} />
            <b className="block">{mode}</b>
            <span
              className={`text-xs ${
                selectedMealMode === mode ? "opacity-75" : "text-muted-foreground"
              }`}
            >
              {modeCopy[mode]}
            </span>
          </button>
        ))}
      </div>

      {selectedMealMode === "Liked Meals" ? (
        <LikedMealsView
          meals={likedMeals}
          openMeal={openMeal}
          addMissing={addMissing}
          removeLike={(meal) => toggleLike(meal, false)}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="cream"
              onClick={() => toast.message("Filters are ready for Supabase.")}
            >
              <SlidersHorizontal /> Filters
            </Button>
            {["30 min", "Cozy", "High-protein", "Easy", "2 servings"].map((label) => (
              <button
                key={label}
                className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-xs font-bold"
              >
                {label}
              </button>
            ))}
          </div>

          <section>
            <SectionTitle eyebrow={selectedMealMode} title="Swipe through today's ideas" />
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              Swipe right to save. Swipe left to skip.
            </p>

            {currentMeal ? (
              <SwipeableMealCard
                meal={currentMeal}
                nextMeals={nextMeals}
                saved={likedMealIds.includes(currentMeal.id)}
                onLike={() => finishCard(currentMeal, "like")}
                onSkip={() => finishCard(currentMeal, "skip")}
                onOpen={() => openMeal(currentMeal)}
                onAdd={() => addMissing(currentMeal)}
              />
            ) : (
              <EmptyState
                icon={ChefHat}
                title="You've reviewed today's ideas."
                copy="Try another mode or adjust your filters."
              />
            )}
          </section>

          <section>
            <SectionTitle eyebrow="All ideas" title="Meals with the details that matter" />
            <div className="grid gap-5 md:grid-cols-2">
              {filterMealsForMode(selectedMealMode, []).map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onClick={() => openMeal(meal)}
                  saved={likedMealIds.includes(meal.id)}
                  onSave={() => toggleLike(meal)}
                  onAdd={() => addMissing(meal)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ModeIcon({ mode }: { mode: MealViewMode }) {
  const Icon =
    mode === "Before I Shop"
      ? ShoppingBasket
      : mode === "Use What I Have"
        ? Refrigerator
        : mode === "Use It Before It Goes Bad"
          ? Clock3
          : Heart;

  return <Icon className="mb-4 size-6" />;
}

function SwipeableMealCard({
  meal,
  nextMeals,
  saved,
  onLike,
  onSkip,
  onOpen,
  onAdd,
}: {
  meal: Meal;
  nextMeals: Meal[];
  saved: boolean;
  onLike: () => void;
  onSkip: () => void;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const start = useRef({ x: 0, y: 0 });

  const resetDrag = () => setDrag({ x: 0, y: 0, active: false });

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag.active) return;
    setDrag({
      x: event.clientX - start.current.x,
      y: Math.max(-24, Math.min(24, event.clientY - start.current.y)),
      active: true,
    });
  };

  const handlePointerUp = () => {
    if (drag.x > 110) {
      resetDrag();
      onLike();
      return;
    }

    if (drag.x < -110) {
      resetDrag();
      onSkip();
      return;
    }

    resetDrag();
  };

  const rotation = drag.x / 24;
  const savedOpacity = Math.min(Math.max(drag.x / 120, 0), 1);
  const skippedOpacity = Math.min(Math.max(-drag.x / 120, 0), 1);

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative h-[660px] sm:h-[700px]">
        {nextMeals.map((nextMeal, index) => (
          <div
            key={nextMeal.id}
            className="app-card absolute inset-x-3 top-5 h-[620px] overflow-hidden bg-card"
            style={{
              transform: `translateY(${(index + 1) * 12}px) scale(${1 - (index + 1) * 0.04})`,
              opacity: 0.45 - index * 0.15,
            }}
          />
        ))}
        <article
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={resetDrag}
          className="app-card absolute inset-x-0 top-0 h-[640px] touch-none overflow-hidden bg-card"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
            transition: drag.active ? "none" : "transform 160ms ease",
          }}
        >
          <div className="relative h-56 overflow-hidden">
            <img
              src={meal.image}
              alt={meal.title}
              width={1024}
              height={768}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute left-4 top-4 rounded-full bg-sage px-4 py-2 text-sm font-bold text-sage-foreground shadow-kitchen"
              style={{ opacity: savedOpacity }}
            >
              Saved
            </div>
            <div
              className="absolute right-4 top-4 rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground shadow-kitchen"
              style={{ opacity: skippedOpacity }}
            >
              Skipped
            </div>
            <span className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1 text-xs font-bold backdrop-blur">
              {meal.cookingMethod}
            </span>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{meal.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{meal.description}</p>
              <p className="mt-3 rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
                {getMealMatchReason(meal)}
              </p>
            </div>

            <MealFacts meal={meal} />

            <div className="grid gap-4 sm:grid-cols-2">
              <IngredientGroup title="Have" items={meal.ingredientsHave} good compact />
              <IngredientGroup
                title="Need"
                items={meal.ingredientsNeed.length ? meal.ingredientsNeed : ["Nothing else"]}
                compact
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="cream" size="kitchen" onClick={onSkip}>
                <X /> Skip
              </Button>
              <Button variant="kitchen" size="kitchen" onClick={onLike}>
                <Heart className={saved ? "fill-primary-foreground" : ""} /> Like
              </Button>
              <Button variant="dark" size="kitchen" onClick={onOpen}>
                Cook
              </Button>
            </div>
            <Button
              variant="ghost"
              size="kitchen"
              className="w-full"
              onClick={onAdd}
              disabled={meal.ingredientsNeed.length === 0}
            >
              <Plus /> Add {meal.ingredientsNeed.length} items to List
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}

function MealCard({
  meal,
  onClick,
  compact,
  saved,
  onSave,
  onAdd,
}: {
  meal: Meal;
  onClick: () => void;
  compact?: boolean;
  saved?: boolean;
  onSave?: () => void;
  onAdd?: () => void;
}) {
  return (
    <article className="app-card group overflow-hidden">
      <button onClick={onClick} className="block w-full text-left">
        <div className={`${compact ? "h-40" : "h-52"} relative overflow-hidden`}>
          <img
            src={meal.image}
            alt={meal.title}
            width={1024}
            height={768}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold backdrop-blur">
            {meal.cookingMethod}
          </span>
          {meal.expiringIngredientsUsed.length > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              Uses {meal.expiringIngredientsUsed[0]} soon
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold leading-tight">{meal.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
            </div>
            <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-semibold text-primary">{getMealMatchReason(meal)}</p>
          <MealFacts meal={meal} />
          {!compact && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <IngredientGroup title="Have" items={meal.ingredientsHave.slice(0, 4)} good compact />
              <IngredientGroup
                title="Need"
                items={meal.ingredientsNeed.length ? meal.ingredientsNeed.slice(0, 4) : ["Nothing"]}
                compact
              />
            </div>
          )}
        </div>
      </button>
      {!compact && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-border/60 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
            disabled={meal.ingredientsNeed.length === 0}
          >
            <Plus /> Add {meal.ingredientsNeed.length}
          </Button>
          <Button variant="kitchen" size="sm" onClick={onClick}>
            Cook this
          </Button>
          <Button variant="ghost" size="icon" onClick={onSave} aria-label="Save meal">
            <Heart className={saved ? "fill-primary text-primary" : ""} />
          </Button>
        </div>
      )}
    </article>
  );
}

function MealFacts({ meal }: { meal: Meal }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
      <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
        <Clock3 className="size-3.5" />
        {meal.timeMinutes} min
      </span>
      <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
        <CookingPot className="size-3.5" />
        {meal.cookingMethod}
      </span>
      <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
        <BadgeCheck className="size-3.5" />
        {meal.difficulty}
      </span>
      <span className="rounded-full bg-secondary px-3 py-1 text-primary">
        {meal.missingIngredientCount} missing
      </span>
    </div>
  );
}

function LikedMealsView({
  meals: likedMeals,
  openMeal,
  addMissing,
  removeLike,
}: {
  meals: Meal[];
  openMeal: (meal: Meal) => void;
  addMissing: (meal: Meal, goToList?: boolean) => void;
  removeLike: (meal: Meal) => void;
}) {
  if (likedMeals.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No liked meals yet."
        copy="Swipe right on a meal idea or tap Save to keep it here."
      />
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Liked Meals" title="Saved ideas for later" />
      <div className="grid gap-5 md:grid-cols-2">
        {likedMeals.map((meal) => (
          <article key={meal.id} className="app-card overflow-hidden">
            <button onClick={() => openMeal(meal)} className="block w-full text-left">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.title}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold backdrop-blur">
                  {meal.cookingMethod}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl font-bold leading-tight">{meal.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{meal.description}</p>
                <MealFacts meal={meal} />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <IngredientGroup
                    title="Have"
                    items={meal.ingredientsHave.slice(0, 4)}
                    good
                    compact
                  />
                  <IngredientGroup
                    title="Need"
                    items={
                      meal.ingredientsNeed.length ? meal.ingredientsNeed.slice(0, 4) : ["Nothing"]
                    }
                    compact
                  />
                </div>
              </div>
            </button>
            <div className="grid gap-2 border-t border-border/60 p-3 sm:grid-cols-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addMissing(meal)}
                disabled={meal.ingredientsNeed.length === 0}
              >
                <Plus /> Add missing
              </Button>
              <Button variant="kitchen" size="sm" onClick={() => openMeal(meal)}>
                Cook this
              </Button>
              <Button variant="cream" size="sm" onClick={() => removeLike(meal)}>
                <Trash2 /> Remove
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ListScreen({
  groceryItems,
  setGroceryItems,
  setTab,
  setSelectedMealMode,
  openShopMode,
  openMoveDialog,
}: {
  groceryItems: GroceryItem[];
  setGroceryItems: Dispatch<SetStateAction<GroceryItem[]>>;
  setTab: Dispatch<SetStateAction<Tab>>;
  setSelectedMealMode: Dispatch<SetStateAction<MealViewMode>>;
  openShopMode: () => void;
  openMoveDialog: () => void;
}) {
  const [newItem, setNewItem] = useState("");
  const grouped = groupGroceryItemsByCategory(groceryItems);
  const progress = calculateCheckedProgress(groceryItems);
  const checkedCount = progress.checked;

  const addManualItem = () => {
    const normalized = normalizeIngredientName(newItem);
    if (!normalized) return;

    let alreadyExists = false;
    setGroceryItems((current) => {
      if (current.some((item) => normalizeIngredientName(item.name) === normalized)) {
        alreadyExists = true;
        return current;
      }

      return [
        ...current,
        {
          id: `manual-${normalized.replace(/\s+/g, "-")}`,
          name: newItem.trim(),
          category: "Other",
          quantity: 1,
          unit: "item",
          checked: false,
          mealIds: [],
          mealNames: [],
        },
      ];
    });

    toast.success(alreadyExists ? "That item is already on your List" : "Added item to your List");
    setNewItem("");
  };

  const openMealIdeas = () => {
    setSelectedMealMode("Before I Shop");
    setTab("meals");
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="mb-2 text-sm font-bold text-primary">Grocery planning</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Your grocery list</h1>
        <p className="mt-2 text-muted-foreground">
          {progress.checked} of {progress.total} items checked. Grouped by where you will find them.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={openMealIdeas}
          className="app-card flex items-center justify-between p-4 text-left"
        >
          <span>
            <b className="block">Add meal ideas</b>
            <span className="text-sm text-muted-foreground">Plan before you shop</span>
          </span>
          <WandSparkles className="text-primary" />
        </button>
        <button
          onClick={openShopMode}
          className="app-card flex items-center justify-between bg-primary p-4 text-left text-primary-foreground"
        >
          <span>
            <b className="block">Shop Mode</b>
            <span className="text-sm opacity-80">Big, thumb-friendly checks</span>
          </span>
          <Store />
        </button>
        <button
          onClick={openMoveDialog}
          disabled={checkedCount === 0}
          className="app-card flex items-center justify-between p-4 text-left disabled:opacity-50"
        >
          <span>
            <b className="block">Move checked to Kitchen</b>
            <span className="text-sm text-muted-foreground">
              {checkedCount > 0
                ? `${checkedCount} ready to put away`
                : "Check items after shopping"}
            </span>
          </span>
          <Archive className="text-primary" />
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addManualItem();
          }}
          placeholder="Add an item..."
          className="h-12 rounded-full bg-card"
        />
        <Button variant="kitchen" size="icon" className="size-12 shrink-0" onClick={addManualItem}>
          <Plus />
        </Button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <GrocerySection
          key={category}
          category={category}
          items={items}
          setGroceryItems={setGroceryItems}
        />
      ))}

      {checkedCount > 0 && (
        <Button
          variant="dark"
          size="kitchen"
          className="sticky bottom-24 w-full sm:bottom-4"
          onClick={openMoveDialog}
        >
          <Archive /> Move checked items to Kitchen
        </Button>
      )}
    </div>
  );
}

function GrocerySection({
  category,
  items,
  setGroceryItems,
}: {
  category: string;
  items: GroceryItem[];
  setGroceryItems: Dispatch<SetStateAction<GroceryItem[]>>;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
        {category}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <GroceryListItem key={item.id} item={item} setGroceryItems={setGroceryItems} />
        ))}
      </div>
    </section>
  );
}

function GroceryListItem({
  item,
  setGroceryItems,
}: {
  item: GroceryItem;
  setGroceryItems: Dispatch<SetStateAction<GroceryItem[]>>;
}) {
  const updateItem = (updater: (item: GroceryItem) => GroceryItem) => {
    setGroceryItems((current) =>
      current.map((candidate) => (candidate.id === item.id ? updater(candidate) : candidate)),
    );
  };

  return (
    <div className={`app-card flex items-center gap-3 p-3 ${item.checked ? "opacity-60" : ""}`}>
      <button
        onClick={() => updateItem((current) => ({ ...current, checked: !current.checked }))}
        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 ${
          item.checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
        aria-label={`Check ${item.name}`}
      >
        {item.checked && <Check className="size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <b className={item.checked ? "line-through" : ""}>{item.name}</b>
          {item.alreadyHave && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              Already have
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.quantity} {item.unit}
          {item.mealNames.length > 0 && ` · for ${item.mealNames.join(", ")}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center rounded-full bg-muted">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            updateItem((current) => ({
              ...current,
              quantity: Math.max(1, current.quantity - 1),
            }))
          }
        >
          <Minus />
        </Button>
        <b className="w-5 text-center text-sm">{item.quantity}</b>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateItem((current) => ({ ...current, quantity: current.quantity + 1 }))}
        >
          <Plus />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Mark ${item.name} as already have`}
        onClick={() => {
          updateItem((current) => ({ ...current, checked: true, alreadyHave: true }));
          toast.success("Marked as already in your Kitchen");
        }}
      >
        <PackageOpen />
      </Button>
    </div>
  );
}

function ShopMode({
  open,
  onOpenChange,
  groceryItems,
  setGroceryItems,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryItems: GroceryItem[];
  setGroceryItems: Dispatch<SetStateAction<GroceryItem[]>>;
}) {
  const grouped = groupGroceryItemsByCategory(groceryItems);
  const progress = calculateCheckedProgress(groceryItems);
  const percent = progress.total === 0 ? 0 : Math.round((progress.checked / progress.total) * 100);

  const toggleItem = (id: string) => {
    setGroceryItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Shop Mode</DialogTitle>
          <DialogDescription className="sr-only">
            A larger grocery shopping checklist grouped by section.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span>
                {progress.checked} of {progress.total} items checked
              </span>
              <span>{percent}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex w-full items-center gap-4 rounded-[1.25rem] border p-4 text-left ${
                      item.checked ? "border-primary bg-secondary" : "border-border bg-card"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border-2 ${
                        item.checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {item.checked && <Check />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-lg">{item.name}</b>
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                        {item.mealNames.length > 0 && ` · for ${item.mealNames[0]}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <Button
            variant="dark"
            size="kitchen"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Exit Shop Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MoveToKitchenDialog({
  open,
  onOpenChange,
  checkedCount,
  onMove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkedCount: number;
  onMove: (location: KitchenItem["location"], expiration: string) => void;
}) {
  const [location, setLocation] = useState<KitchenItem["location"]>("Fridge");
  const [expiration, setExpiration] = useState("7 days");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Move checked items to Kitchen</DialogTitle>
          <DialogDescription className="sr-only">
            Assign a location and expiration date before moving checked grocery items.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Add {checkedCount} checked item{checkedCount === 1 ? "" : "s"} to your Kitchen with a
            shared location and expiration date for now.
          </p>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Location</span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value as KitchenItem["location"])}
              className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option>Fridge</option>
              <option>Freezer</option>
              <option>Pantry</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Expiration</span>
            <Input
              value={expiration}
              onChange={(event) => setExpiration(event.target.value)}
              placeholder="7 days"
              className="h-12 rounded-xl"
            />
          </label>
          <Button
            variant="kitchen"
            size="kitchen"
            className="w-full"
            onClick={() => onMove(location, expiration)}
            disabled={checkedCount === 0}
          >
            <Archive /> Move to Kitchen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KitchenScreen({
  search,
  setSearch,
  filter,
  setFilter,
  items,
  allItems,
  openAdd,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filter: KitchenFilter;
  setFilter: Dispatch<SetStateAction<KitchenFilter>>;
  items: KitchenItem[];
  allItems: KitchenItem[];
  openAdd: (m?: ModalState) => void;
}) {
  const filters: KitchenFilter[] = [
    "All",
    "Fridge",
    "Freezer",
    "Pantry",
    "Expiring soon",
    "Expired",
    "Recently added",
  ];

  return (
    <div className="space-y-7">
      <section className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold text-primary">What you already have</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Kitchen</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track your fridge, freezer, and pantry so meal ideas and grocery lists stay honest.
          </p>
        </div>
        <Button variant="kitchen" size="kitchen" onClick={() => openAdd("add")}>
          <Plus /> Add food
        </Button>
      </section>

      <div className="grid grid-cols-4 gap-2">
        <Stat value={String(allItems.length)} label="total" />
        <Stat
          value={String(allItems.filter((item) => item.status === "Expiring soon").length)}
          label="use soon"
          warm
        />
        <Stat
          value={String(allItems.filter((item) => item.status === "Expired").length)}
          label="expired"
        />
        <Stat value={String(allItems.filter((item) => item.recentlyAdded).length)} label="new" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search fridge, freezer, pantry, tags..."
            className="h-12 rounded-full bg-card pl-12"
          />
        </div>
        <Button
          variant="cream"
          size="kitchen"
          onClick={() => toast.message("Filters applied locally.")}
        >
          <Menu /> Filter & sort
        </Button>
      </div>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {filters.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
              filter === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <section>
        <SectionTitle title="Add groceries to Kitchen or List" />
        <div className="grid grid-cols-5 gap-2">
          {(
            [
              [Mic, "Voice", "voice"],
              [Camera, "Receipt", "receipt"],
              [ScanLine, "Barcode", "barcode"],
              [CirclePlus, "Manual", "add"],
              [ListChecks, "Bulk", "add"],
            ] as const
          ).map(([Icon, label, key]) => (
            <button
              key={label}
              onClick={() => openAdd(key)}
              className="app-card flex flex-col items-center gap-2 px-2 py-4 text-xs font-bold transition-transform hover:-translate-y-1"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        {items.map((item) => (
          <KitchenItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function KitchenItemCard({ item }: { item: KitchenItem }) {
  return (
    <div className="app-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 sm:p-4">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-primary">
        {item.location === "Freezer" ? (
          <PackageOpen />
        ) : item.location === "Pantry" ? (
          <Archive />
        ) : (
          <Refrigerator />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <b className="truncate">{item.name}</b>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              item.status === "Expiring soon"
                ? "bg-secondary text-primary"
                : item.status === "Expired"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-accent text-accent-foreground"
            }`}
          >
            {item.status}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
            {item.location}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.quantity} · {item.category} · expires {item.expiration}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">Tags: {item.tags.join(", ")}</p>
      </div>
      <div className="flex shrink-0">
        <Button variant="ghost" size="icon" aria-label="Use item">
          <Check />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit item">
          <Edit3 />
        </Button>
      </div>
    </div>
  );
}

function HouseholdScreen({ setModal }: { setModal: Dispatch<SetStateAction<ModalState>> }) {
  return (
    <div className="space-y-7">
      <section>
        <p className="mb-2 text-sm font-bold text-primary">One kitchen, fewer mysteries</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">The Snack Pack</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Share one Kitchen, one List, and the same meal plan with roommates or family.
        </p>
      </section>
      <div className="app-card overflow-hidden">
        <div className="bg-sage p-6 text-sage-foreground">
          <UsersRound className="mb-5 size-10" />
          <h2 className="font-display text-2xl font-bold">Invite your kitchen people</h2>
          <p className="mt-2 text-sm opacity-75">Share a link or tell them to enter this code.</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-background/25 p-4">
            <span className="font-mono text-2xl font-bold tracking-[.3em]">FRDG42</span>
            <Button variant="cream" size="sm">
              Copy code
            </Button>
          </div>
        </div>
        <div className="p-5">
          <b className="mb-4 block">Members</b>
          {[
            ["AP", "Alex Parker", "Owner"],
            ["JM", "Jamie M.", "Can edit"],
          ].map(([initials, name, role]) => (
            <div
              key={name}
              className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
            >
              <span className="grid size-10 place-items-center rounded-full bg-secondary font-bold text-primary">
                {initials}
              </span>
              <div className="flex-1">
                <b className="block text-sm">{name}</b>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="kitchen" size="kitchen">
          <Plus /> Invite by link
        </Button>
        <Button variant="cream" size="kitchen">
          Join with a code
        </Button>
      </div>
      <button
        onClick={() => setModal("settings")}
        className="app-card flex w-full items-center justify-between p-5 text-left"
      >
        <span>
          <b className="block">Household settings</b>
          <span className="text-sm text-muted-foreground">
            Members, access, locations, and privacy
          </span>
        </span>
        <ChevronRight />
      </button>
    </div>
  );
}

function MealDialog({
  meal,
  onClose,
  onAdd,
  saved,
  onSave,
}: {
  meal: Meal | null;
  onClose: () => void;
  onAdd: (meal: Meal, goToList?: boolean) => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={!!meal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-[2rem] p-0">
        {meal && (
          <>
            <div className="relative h-64">
              <img
                src={meal.image}
                alt={meal.title}
                width={1024}
                height={768}
                className="h-full w-full object-cover"
              />
              <Button
                variant="cream"
                size="icon"
                className="absolute left-4 top-4"
                onClick={onClose}
              >
                <ChevronLeft />
              </Button>
            </div>
            <div className="space-y-6 p-5 sm:p-7">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    {meal.cookingMethod}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
                    {meal.timeMinutes} min · {meal.difficulty}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
                    {meal.servings} servings
                  </span>
                </div>
                <DialogTitle className="font-display text-3xl leading-tight">
                  {meal.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Meal details with ingredients, steps, substitutions, and list actions.
                </DialogDescription>
                <p className="mt-3 text-muted-foreground">{meal.description}</p>
              </div>
              <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
                <b>Why this works</b>
                <p className="mt-1 text-sm opacity-80">{meal.whyThisWorks}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <IngredientGroup title="You have" items={meal.ingredientsHave} good />
                <IngredientGroup
                  title="You need"
                  items={meal.ingredientsNeed.length ? meal.ingredientsNeed : ["Nothing else"]}
                />
              </div>
              {meal.expiringIngredientsUsed.length > 0 && (
                <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <b>Uses before it goes bad</b>
                  <p className="mt-1 text-sm">{meal.expiringIngredientsUsed.join(", ")}</p>
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-bold">Cook this</h3>
                <ol className="mt-4 space-y-4">
                  {meal.steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <b>Easy swaps</b>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {meal.substitutions.map((substitution) => (
                    <li key={substitution}>{substitution}</li>
                  ))}
                </ul>
              </div>
              <div className="sticky bottom-0 grid gap-2 bg-card py-2 sm:grid-cols-[1fr_auto_1fr]">
                <Button
                  variant="kitchen"
                  size="kitchen"
                  onClick={() => onAdd(meal)}
                  disabled={!meal.ingredientsNeed.length}
                >
                  <Plus /> Add missing items to List
                </Button>
                <Button variant="cream" size="kitchen" onClick={onSave}>
                  <Heart className={saved ? "fill-primary text-primary" : ""} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="dark" size="kitchen">
                  Cook this
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IngredientGroup({
  title,
  items,
  good,
  compact,
}: {
  title: string;
  items: string[];
  good?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <h3 className={`mb-3 font-display font-bold ${compact ? "text-base" : "text-xl"}`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm">
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                good ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"
              }`}
            >
              {good ? <Check className="size-3" /> : <Plus className="size-3" />}
            </span>
            <span className="truncate">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <div className="app-card grid min-h-72 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
          <Icon />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

function FlowDialog({
  modal,
  setModal,
}: {
  modal: ModalState;
  setModal: Dispatch<SetStateAction<ModalState>>;
}) {
  const [stage, setStage] = useState(0);
  const close = () => {
    setModal(null);
    setStage(0);
  };
  const auth = async (provider: "google" | "apple") => {
    await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
  };
  return (
    <Dialog open={!!modal} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-[2rem]">
        {modal === "auth" && (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">Your Kitchen, everywhere.</DialogTitle>
              <DialogDescription className="sr-only">
                Sign in options for syncing Kitchen, List, saved meals, and household data.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Sync your Kitchen, List, saved meals, and household. Guest mode stays on this device.
            </p>
            <Button variant="dark" size="kitchen" className="w-full" onClick={() => auth("apple")}>
              <Apple /> Continue with Apple
            </Button>
            <Button
              variant="cream"
              size="kitchen"
              className="w-full"
              onClick={() => auth("google")}
            >
              <span className="font-bold">G</span> Continue with Google
            </Button>
            <Button variant="outline" size="kitchen" className="w-full">
              Continue with email
            </Button>
            <button onClick={close} className="w-full text-sm font-bold text-primary">
              Keep exploring as a guest
            </button>
          </div>
        )}
        {modal === "settings" && <SettingsPanel />}
        {modal === "add" && (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">Add groceries</DialogTitle>
              <DialogDescription className="sr-only">
                Add groceries by voice, receipt scan, barcode scan, bulk entry, or manual entry.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Add food to Kitchen now, or capture something for the List before you shop.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  [Mic, "Say it", "voice"],
                  [Camera, "Scan receipt", "receipt"],
                  [ScanLine, "Scan barcode", "barcode"],
                  [ListChecks, "Bulk add", "add"],
                ] as const
              ).map(([Icon, label, key]) => (
                <button
                  key={label}
                  onClick={() => setModal(key)}
                  className="app-card flex flex-col items-start gap-4 p-4 font-bold"
                >
                  <Icon className="size-6 text-primary" />
                  {label}
                </button>
              ))}
            </div>
            <ManualForm />
          </div>
        )}
        {modal === "voice" && (
          <SimulatedFlow type="voice" stage={stage} setStage={setStage} close={close} />
        )}
        {modal === "receipt" && (
          <SimulatedFlow type="receipt" stage={stage} setStage={setStage} close={close} />
        )}
        {modal === "barcode" && (
          <SimulatedFlow type="barcode" stage={stage} setStage={setStage} close={close} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ManualForm() {
  return (
    <div className="space-y-3">
      <b className="block">Or enter it manually</b>
      <Input placeholder="Item name" className="h-12 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Quantity" className="h-12 rounded-xl" />
        <select className="h-12 rounded-xl border border-input bg-background px-3 text-sm">
          <option>Fridge</option>
          <option>Freezer</option>
          <option>Pantry</option>
          <option>List</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" className="h-12 rounded-xl" />
        <Input placeholder="Category" className="h-12 rounded-xl" />
      </div>
      <Input placeholder="Tags or notes" className="h-12 rounded-xl" />
      <Button variant="kitchen" size="kitchen" className="w-full">
        <Plus /> Add to Kitchen
      </Button>
    </div>
  );
}

function SimulatedFlow({
  type,
  stage,
  setStage,
  close,
}: {
  type: "voice" | "receipt" | "barcode";
  stage: number;
  setStage: Dispatch<SetStateAction<number>>;
  close: () => void;
}) {
  const config = {
    voice: {
      title: "Tell me what came home or what you need",
      icon: Mic,
      copy: "Try: Add chicken to Kitchen, and put broccoli and limes on my List.",
    },
    receipt: {
      title: "Scan your receipt",
      icon: Camera,
      copy: "Receipt scan adds purchased groceries to Kitchen with suggested locations.",
    },
    barcode: {
      title: "Scan a barcode",
      icon: ScanLine,
      copy: "Barcode scan can add packaged food to Kitchen or save it to List.",
    },
  };
  const { title, icon: Icon, copy } = config[type];
  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="font-display text-3xl">
          {stage ? "Nice haul. Check the details." : title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Simulated grocery capture flow for adding items to Kitchen or List.
        </DialogDescription>
      </DialogHeader>
      {!stage ? (
        <>
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.5rem] bg-foreground text-background">
            <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-background/50" />
            <div className="text-center">
              <Icon className="mx-auto size-12" />
              <p className="mt-3 max-w-xs px-6 text-sm opacity-70">{copy}</p>
            </div>
            {type === "barcode" && (
              <div className="absolute inset-x-10 top-1/2 h-0.5 bg-primary shadow-[0_0_16px_var(--primary)]" />
            )}
          </div>
          <Button variant="kitchen" size="kitchen" className="w-full" onClick={() => setStage(1)}>
            {type === "voice" ? (
              <>
                <Mic />
                Start listening
              </>
            ) : (
              <>
                <Sparkles />
                Simulate scan
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
            <Sparkles className="mb-2 size-5" />
            <b>Parsed and tidied up</b>
            <p className="opacity-75">
              Names expanded, duplicates grouped, and sensible locations suggested.
            </p>
          </div>
          <div className="space-y-2">
            {(type === "barcode"
              ? [["Organic almond milk", "1 carton", "Kitchen"]]
              : [
                  ["Chicken breasts", "2 pieces", "Kitchen"],
                  ["Large eggs", "12", "Kitchen"],
                  ["Baby spinach", "1 bag", "Kitchen"],
                  ["Limes", "4", "List"],
                ]
            ).map((item) => (
              <div key={item[0]} className="app-card grid grid-cols-[1fr_auto] gap-2 p-3">
                <div>
                  <b className="block text-sm">{item[0]}</b>
                  <span className="text-xs text-muted-foreground">
                    {item[1]} · {item[2]}
                  </span>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit3 />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="kitchen"
            size="kitchen"
            className="w-full"
            onClick={() => {
              toast.success("Added items");
              close();
            }}
          >
            <Check />
            Add everything
          </Button>
        </>
      )}
    </div>
  );
}

function SettingsPanel() {
  const [reminders, setReminders] = useState([true, true, false, true, true]);
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="font-display text-3xl">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          App settings for profile, household, locations, categories, reminders, and privacy.
        </DialogDescription>
      </DialogHeader>
      {["Profile", "Household", "Locations", "Categories & tags"].map((item) => (
        <button
          key={item}
          className="flex w-full items-center justify-between border-b border-border py-3 text-left font-semibold"
        >
          {item}
          <ChevronRight className="size-4" />
        </button>
      ))}
      <div>
        <b className="mb-3 block">Friendly nudges</b>
        {[
          "Food expiring in 3 days",
          "Food expiring tomorrow",
          "Expired food summary",
          "Household invite accepted",
          "Weekly meal ideas",
        ].map((item, index) => (
          <label key={item} className="flex items-center justify-between py-2 text-sm">
            <span>{item}</span>
            <Switch
              checked={reminders[index]}
              onCheckedChange={(value) =>
                setReminders((current) =>
                  current.map((reminder, reminderIndex) =>
                    reminderIndex === index ? value : reminder,
                  ),
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="rounded-2xl bg-muted p-4">
        <Leaf className="mb-3 size-5 text-primary" />
        <b>Privacy without the garnish</b>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the app without an account. Household sharing is optional, and you control every item
          you add.
        </p>
      </div>
      {["Theme", "Export Kitchen", "Delete account"].map((item) => (
        <button
          key={item}
          className={`flex w-full items-center justify-between py-2 text-left text-sm font-semibold ${
            item === "Delete account" ? "text-destructive" : ""
          }`}
        >
          {item}
          <ChevronRight className="size-4" />
        </button>
      ))}
    </div>
  );
}
