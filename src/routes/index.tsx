import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Apple, Archive, Bell, Camera, Check, ChevronLeft, ChevronRight, ChefHat,
  CirclePlus, Clock3, CookingPot, Edit3, Heart, Home, Leaf, ListChecks,
  Menu, Mic, Minus, PackageOpen, Plus, Refrigerator, ScanLine, Search,
  Settings, ShoppingBasket, Sparkles, Sun, Trash2, UserRound, UsersRound,
  WandSparkles, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { lovable } from "@/integrations/lovable";
import gochujangImage from "@/assets/gochujang-bowls.jpg";
import tomatoEggImage from "@/assets/tomato-egg-rice.jpg";
import salmonTacosImage from "@/assets/salmon-tacos.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "What The Fridge?! — Cook What You Have" },
      { name: "description", content: "Get delicious meal ideas from your real kitchen, waste less food, and shop with a plan." },
      { property: "og:title", content: "What The Fridge?!" },
      { property: "og:description", content: "Open the fridge. See what you can make. Waste less and shop smarter." },
    ],
  }),
  component: Index,
});

type Tab = "home" | "ideas" | "inventory" | "shopping" | "household";
type Meal = { id: number; name: string; description: string; image: string; time: string; method: string; have: string[]; need: string[]; expiring: string[] };

const meals: Meal[] = [
  { id: 1, name: "Sheet Pan Gochujang Chicken Bowls", description: "Sticky-spicy chicken, crisp broccoli, and fluffy rice with a bright lemon finish.", image: gochujangImage, time: "35 min", method: "Sheet pan", have: ["Chicken thighs", "Broccoli", "Frozen rice", "Gochujang"], need: ["Sesame seeds"], expiring: ["Chicken thighs", "Spinach"] },
  { id: 2, name: "Cozy Tomato Egg Rice", description: "Jammy tomato rice, soft eggs, and garlicky spinach for peak low-effort comfort.", image: tomatoEggImage, time: "20 min", method: "Stovetop", have: ["Eggs", "Frozen rice", "Spinach", "Tomato paste"], need: ["Scallions"], expiring: ["Spinach"] },
  { id: 3, name: "Air Fryer Salmon Tacos", description: "Golden salmon, creamy avocado, crunchy slaw, and lots of lime.", image: salmonTacosImage, time: "25 min", method: "Air fryer", have: ["Tortillas", "Avocados", "Greek yogurt", "Lemons"], need: ["Salmon", "Cabbage"], expiring: ["Greek yogurt"] },
  { id: 4, name: "Pantry Pasta with Crispy Garlic", description: "Glossy tomato pasta with golden garlic and a handful of sharp cheddar.", image: tomatoEggImage, time: "22 min", method: "One-pot", have: ["Pasta", "Tomato paste", "Garlic", "Cheddar"], need: [], expiring: [] },
];

const inventorySeed = [
  ["Spinach", "1 bag", "Fridge", "Tomorrow", "Expiring soon"], ["Greek yogurt", "¾ tub", "Fridge", "2 days", "Expiring soon"],
  ["Chicken thighs", "4 pieces", "Fridge", "3 days", "Expiring soon"], ["Strawberries", "1 punnet", "Fridge", "4 days", "Fresh"],
  ["Eggs", "10", "Fridge", "9 days", "Fresh"], ["Almond milk", "1 carton", "Fridge", "7 days", "Fresh"],
  ["Frozen rice", "2 packs", "Freezer", "3 months", "Fresh"], ["Pasta", "1 box", "Pantry", "8 months", "Fresh"],
];

function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modal, setModal] = useState<"add" | "voice" | "receipt" | "barcode" | "auth" | "settings" | null>(null);
  const [dark, setDark] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [shopping, setShopping] = useState([{ name: "Salmon fillets", category: "Protein", qty: 2, checked: false }, { name: "Red cabbage", category: "Produce", qty: 1, checked: false }, { name: "Scallions", category: "Produce", qty: 1, checked: true }, { name: "Sesame seeds", category: "Pantry", qty: 1, checked: false }]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("Use What I Have");
  const [showFilters, setShowFilters] = useState(false);

  const visibleInventory = useMemo(() => inventorySeed.filter(item => item[0].toLowerCase().includes(search.toLowerCase())), [search]);
  const openAdd = (kind: typeof modal = "add") => setModal(kind);
  const addMissing = (meal: Meal) => {
    setShopping(prev => [...prev, ...meal.need.filter(name => !prev.some(item => item.name === name)).map(name => ({ name, category: "From meal", qty: 1, checked: false }))]);
    setTab("shopping"); setSelectedMeal(null);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
            <button onClick={() => setTab("home")} className="flex min-w-0 items-center gap-2 text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-kitchen"><Refrigerator className="size-5" /></span>
              <span className="truncate font-display text-lg font-bold tracking-tight">What The Fridge?!</span>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark(v => !v)}><Sun /></Button>
              <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setModal("settings")}><Settings /></Button>
              <Button variant="cream" size="sm" onClick={() => setModal("auth")}><UserRound /> <span className="hidden sm:inline">Sign in</span></Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12">
          {tab === "home" && <HomeScreen setTab={setTab} openAdd={openAdd} openMeal={setSelectedMeal} />}
          {tab === "ideas" && <IdeasScreen mode={mode} setMode={setMode} showFilters={showFilters} setShowFilters={setShowFilters} openMeal={setSelectedMeal} saved={saved} setSaved={setSaved} addMissing={addMissing} />}
          {tab === "inventory" && <InventoryScreen search={search} setSearch={setSearch} items={visibleInventory} openAdd={openAdd} />}
          {tab === "shopping" && <ShoppingScreen shopping={shopping} setShopping={setShopping} setTab={setTab} />}
          {tab === "household" && <HouseholdScreen setModal={setModal} />}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:sticky sm:mx-auto sm:mb-5 sm:w-fit sm:rounded-full sm:border sm:px-3 sm:shadow-kitchen">
          <div className="mx-auto flex max-w-xl justify-around gap-1">
            {([ ["home", Home, "Home"], ["ideas", ChefHat, "Meal Ideas"], ["inventory", Refrigerator, "Inventory"], ["shopping", ShoppingBasket, "Shopping"], ["household", UsersRound, "Household"] ] as const).map(([id, Icon, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all sm:min-w-20 ${tab === id ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="size-5" />{label}</button>
            ))}
          </div>
        </nav>

        <MealDialog meal={selectedMeal} onClose={() => setSelectedMeal(null)} onAdd={addMissing} saved={selectedMeal ? saved.includes(selectedMeal.id) : false} onSave={() => selectedMeal && setSaved(v => v.includes(selectedMeal.id) ? v.filter(id => id !== selectedMeal.id) : [...v, selectedMeal.id])} />
        <FlowDialog modal={modal} setModal={setModal} />
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"><div className="min-w-0">{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>}<h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2></div>{action}</div>;
}

function HomeScreen({ setTab, openAdd, openMeal }: { setTab: (t: Tab) => void; openAdd: (m?: any) => void; openMeal: (m: Meal) => void }) {
  return <div className="space-y-8">
    <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
      <div><p className="mb-2 text-sm font-semibold text-primary">Good evening, hungry human.</p><h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl">What are we making tonight?</h1><p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">Your kitchen has options. Let’s turn the good stuff into dinner before it turns questionable.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <button onClick={() => setTab("ideas")} className="group flex items-center justify-between rounded-[1.75rem] bg-primary p-5 text-left text-primary-foreground shadow-kitchen transition-transform hover:-translate-y-1"><span><b className="block text-lg">Cook with what I have</b><span className="text-sm opacity-80">19 ingredients → 12 good ideas</span></span><CookingPot className="size-8 transition-transform group-hover:rotate-6" /></button>
        <button onClick={() => setTab("shopping")} className="group flex items-center justify-between rounded-[1.75rem] bg-sage p-5 text-left text-sage-foreground shadow-kitchen transition-transform hover:-translate-y-1"><span><b className="block text-lg">Give me ideas before I shop</b><span className="text-sm opacity-75">Plan the meal, then the list</span></span><ShoppingBasket className="size-8" /></button>
      </div>
    </section>
    <section className="grid grid-cols-3 gap-3"><Stat value="20" label="items on hand" /><Stat value="4" label="use soon" warm /><Stat value="12" label="meal matches" /></section>
    <section><SectionTitle eyebrow="Use these first" title="Good food on a deadline" action={<button onClick={() => setTab("inventory")} className="text-sm font-bold text-primary">See all</button>} /><div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">{[["🥬","Spinach","Tomorrow"],["🥣","Greek yogurt","2 days"],["🍗","Chicken thighs","3 days"],["🍓","Strawberries","4 days"]].map(([emoji,name,date]) => <div key={name} className="app-card min-w-40 p-4"><span className="text-3xl">{emoji}</span><b className="mt-3 block">{name}</b><span className="text-xs font-bold text-primary">Use in {date}</span></div>)}</div></section>
    <section><SectionTitle eyebrow="Smart matches" title="Dinner that saves the spinach" action={<button onClick={() => setTab("ideas")} className="text-sm font-bold text-primary">More ideas</button>} /><div className="grid gap-4 md:grid-cols-3">{meals.slice(0,3).map(meal => <MealCard key={meal.id} meal={meal} onClick={() => openMeal(meal)} compact />)}</div></section>
    <section><SectionTitle title="Add food, your way" /><div className="grid grid-cols-4 gap-2">{([[Mic,"Voice","voice"],[Camera,"Receipt","receipt"],[ScanLine,"Barcode","barcode"],[CirclePlus,"Manual","add"]] as const).map(([Icon,label,key]) => <button key={label} onClick={() => openAdd(key)} className="app-card flex flex-col items-center gap-2 px-2 py-4 text-xs font-bold transition-transform hover:-translate-y-1"><span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-5" /></span>{label}</button>)}</div></section>
  </div>;
}

function Stat({ value, label, warm }: { value: string; label: string; warm?: boolean }) { return <div className={`rounded-[1.4rem] p-4 ${warm ? "bg-secondary text-secondary-foreground" : "app-card"}`}><b className="font-display text-2xl sm:text-3xl">{value}</b><span className="mt-1 block text-[11px] font-semibold text-muted-foreground sm:text-sm">{label}</span></div>; }

function IdeasScreen({ mode, setMode, showFilters, setShowFilters, openMeal, saved, setSaved, addMissing }: any) {
  const modes = [["Use What I Have", Refrigerator, "Best matches from your kitchen"], ["Cook Tonight", Sparkles, "One confident answer"], ["Before I Shop", ShoppingBasket, "Inspiration first, list second"], ["Use It Before It Goes Bad", Clock3, "Rescue the urgent stuff"]] as const;
  return <div className="space-y-7"><section><p className="mb-2 text-sm font-bold text-primary">Your kitchen, interpreted</p><h1 className="font-display text-4xl font-bold sm:text-5xl">What sounds good?</h1><p className="mt-2 text-muted-foreground">Pick a direction. We’ll do the fridge math.</p></section>
    <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">{modes.map(([name,Icon,desc]) => <button key={name} onClick={() => setMode(name)} className={`min-w-56 rounded-[1.5rem] border p-4 text-left transition-all ${mode === name ? "border-primary bg-primary text-primary-foreground shadow-kitchen" : "border-border bg-card"}`}><Icon className="mb-4 size-6"/><b className="block">{name}</b><span className={`text-xs ${mode===name ? "opacity-75" : "text-muted-foreground"}`}>{desc}</span></button>)}</div>
    <div className="flex items-center gap-2 overflow-x-auto"><Button variant="cream" onClick={() => setShowFilters(!showFilters)}><Menu/> Filters</Button>{["30 min","Cozy","High-protein","Easy","2 servings"].map(x => <button key={x} className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-xs font-bold">{x}</button>)}</div>
    {showFilters && <div className="app-card grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">{[["Time",["15 min","30 min","45 min","1 hour+"]],["Vibe",["Cozy","Healthy","Cheap","Date night"]],["Method",["Sheet pan","Air fryer","One-pot","No-cook"]],["Diet",["Vegetarian","Dairy-free","Gluten-free","High-protein"]]].map(([title,options]: any) => <div key={title}><b className="mb-2 block text-sm">{title}</b><div className="flex flex-wrap gap-2">{options.map((o:string) => <button key={o} className="rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-secondary">{o}</button>)}</div></div>)}</div>}
    <SectionTitle eyebrow={mode} title={mode === "Cook Tonight" ? "Your strongest dinner move" : "Ideas worth opening the fridge for"} />
    <div className="grid gap-5 md:grid-cols-2">{meals.map(meal => <MealCard key={meal.id} meal={meal} onClick={() => openMeal(meal)} saved={saved.includes(meal.id)} onSave={() => setSaved((v:number[]) => v.includes(meal.id)?v.filter(x=>x!==meal.id):[...v,meal.id])} onAdd={() => addMissing(meal)} />)}</div>
  </div>;
}

function MealCard({ meal, onClick, compact, saved, onSave, onAdd }: { meal: Meal; onClick: () => void; compact?: boolean; saved?: boolean; onSave?: () => void; onAdd?: () => void }) {
  return <article className="app-card group overflow-hidden"><button onClick={onClick} className="block w-full text-left"><div className={`${compact ? "h-40" : "h-52"} relative overflow-hidden`}><img src={meal.image} alt={meal.name} width={1024} height={768} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold backdrop-blur">{meal.method}</span>{meal.expiring.length>0 && <span className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">Uses {meal.expiring[0]} soon</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-bold leading-tight">{meal.name}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{meal.description}</p></div><ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground"/></div><div className="mt-3 flex gap-4 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3.5"/>{meal.time}</span><span className="flex items-center gap-1"><Check className="size-3.5"/>{meal.have.length} on hand</span></div></div></button>{!compact && <div className="flex gap-2 border-t border-border/60 p-3"><Button variant="kitchen" size="sm" onClick={onClick}>Cook this</Button><Button variant="ghost" size="sm" onClick={onAdd} disabled={meal.need.length===0}><Plus/> Missing</Button><Button variant="ghost" size="icon" className="ml-auto" onClick={onSave} aria-label="Save idea"><Heart className={saved ? "fill-primary text-primary" : ""}/></Button></div>}</article>;
}

function InventoryScreen({ search, setSearch, items, openAdd }: any) {
  return <div className="space-y-7"><section className="flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-bold text-primary">The engine room</p><h1 className="font-display text-4xl font-bold sm:text-5xl">Your kitchen</h1></div><Button variant="kitchen" size="kitchen" onClick={() => openAdd("add")}><Plus/> Add food</Button></section>
    <div className="grid grid-cols-4 gap-2"><Stat value="20" label="total"/><Stat value="4" label="use soon" warm/><Stat value="0" label="expired"/><Stat value="6" label="new"/></div>
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><div className="relative"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your fridge, freezer, pantry..." className="h-12 rounded-full bg-card pl-12"/></div><Button variant="cream" size="kitchen"><Menu/> Filter & sort</Button></div>
    <div className="space-y-3">{items.map((item:string[]) => <div key={item[0]} className="app-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 sm:p-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">{item[2]==="Freezer"?"❄️":item[2]==="Pantry"?"🥫":"🍽️"}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="truncate">{item[0]}</b><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item[4]==="Expiring soon"?"bg-secondary text-primary":"bg-accent text-accent-foreground"}`}>{item[4]}</span></div><p className="mt-1 text-xs text-muted-foreground">{item[1]} · {item[2]} · {item[3]}</p></div><div className="flex shrink-0"><Button variant="ghost" size="icon" aria-label="Use item"><Check/></Button><Button variant="ghost" size="icon" aria-label="Edit item"><Edit3/></Button></div></div>)}</div>
  </div>;
}

function ShoppingScreen({ shopping, setShopping, setTab }: any) {
  const categories = [...new Set(shopping.map((x:any)=>x.category))] as string[];
  return <div className="space-y-7"><section><p className="mb-2 text-sm font-bold text-primary">Shop with a point</p><h1 className="font-display text-4xl font-bold sm:text-5xl">Shopping list</h1><p className="mt-2 text-muted-foreground">{shopping.filter((x:any)=>!x.checked).length} things left. You’re suspiciously organized.</p></section>
    <button onClick={()=>setTab("ideas")} className="flex w-full items-center justify-between rounded-[1.75rem] bg-sage p-5 text-left text-sage-foreground shadow-kitchen"><span><b className="block text-lg">Plan meals before shopping</b><span className="text-sm opacity-75">Choose dinner, get the exact list</span></span><WandSparkles/></button>
    <div className="flex gap-2"><Input placeholder="Add an item..." className="h-12 rounded-full bg-card"/><Button variant="kitchen" size="icon" className="size-12 shrink-0"><Plus/></Button></div>
    {categories.map(category => <section key={category}><h2 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{category}</h2><div className="space-y-2">{shopping.filter((x:any)=>x.category===category).map((item:any, i:number) => { const idx=shopping.indexOf(item); return <div key={`${item.name}-${i}`} className={`app-card flex items-center gap-3 p-3 ${item.checked?"opacity-55":""}`}><button onClick={()=>setShopping((v:any[])=>v.map((x,j)=>j===idx?{...x,checked:!x.checked}:x))} className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${item.checked?"border-primary bg-primary text-primary-foreground":"border-border"}`}>{item.checked&&<Check className="size-4"/>}</button><span className={`min-w-0 flex-1 font-semibold ${item.checked?"line-through":""}`}>{item.name}</span><div className="flex items-center rounded-full bg-muted"><Button variant="ghost" size="icon" onClick={()=>setShopping((v:any[])=>v.map((x,j)=>j===idx?{...x,qty:Math.max(1,x.qty-1)}:x))}><Minus/></Button><b className="w-5 text-center text-sm">{item.qty}</b><Button variant="ghost" size="icon" onClick={()=>setShopping((v:any[])=>v.map((x,j)=>j===idx?{...x,qty:x.qty+1}:x))}><Plus/></Button></div></div>})}</div></section>)}
    {shopping.some((x:any)=>x.checked) && <Button variant="dark" size="kitchen" className="sticky bottom-24 w-full sm:bottom-4"><Archive/> Move purchased items to inventory</Button>}
  </div>;
}

function HouseholdScreen({ setModal }: any) { return <div className="space-y-7"><section><p className="mb-2 text-sm font-bold text-primary">One kitchen, fewer mysteries</p><h1 className="font-display text-4xl font-bold sm:text-5xl">The Snack Pack</h1><p className="mt-2 max-w-2xl text-muted-foreground">Share one kitchen inventory with roommates, family, or whoever keeps buying a third jar of peanut butter.</p></section><div className="app-card overflow-hidden"><div className="bg-sage p-6 text-sage-foreground"><UsersRound className="mb-5 size-10"/><h2 className="font-display text-2xl font-bold">Invite your kitchen people</h2><p className="mt-2 text-sm opacity-75">Share a link or tell them to enter this code.</p><div className="mt-5 flex items-center justify-between rounded-2xl bg-background/25 p-4"><span className="font-mono text-2xl font-bold tracking-[.3em]">FRDG42</span><Button variant="cream" size="sm">Copy code</Button></div></div><div className="p-5"><b className="mb-4 block">Members</b>{[["AP","Alex Parker","Owner"],["JM","Jamie M.","Can edit"]].map(([initials,name,role])=><div key={name} className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"><span className="grid size-10 place-items-center rounded-full bg-secondary font-bold text-primary">{initials}</span><div className="flex-1"><b className="block text-sm">{name}</b><span className="text-xs text-muted-foreground">{role}</span></div><Button variant="ghost" size="icon"><Menu/></Button></div>)}</div></div><div className="grid gap-3 sm:grid-cols-2"><Button variant="kitchen" size="kitchen"><Plus/> Invite by link</Button><Button variant="cream" size="kitchen">Join with a code</Button></div><button onClick={()=>setModal("settings")} className="app-card flex w-full items-center justify-between p-5 text-left"><span><b className="block">Household settings</b><span className="text-sm text-muted-foreground">Members, access, locations, and privacy</span></span><ChevronRight/></button></div>; }

function MealDialog({ meal, onClose, onAdd, saved, onSave }: any) { return <Dialog open={!!meal} onOpenChange={o=>!o&&onClose()}><DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-[2rem] p-0">{meal&&<><div className="relative h-64"><img src={meal.image} alt={meal.name} width={1024} height={768} className="h-full w-full object-cover"/><Button variant="cream" size="icon" className="absolute left-4 top-4" onClick={onClose}><ChevronLeft/></Button></div><div className="space-y-6 p-5 sm:p-7"><div><div className="mb-3 flex gap-2"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{meal.method}</span><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{meal.time} · Easy</span></div><DialogTitle className="font-display text-3xl leading-tight">{meal.name}</DialogTitle><p className="mt-3 text-muted-foreground">{meal.description}</p></div><div className="rounded-2xl bg-accent p-4 text-accent-foreground"><b>Why this works</b><p className="mt-1 text-sm opacity-80">It uses {meal.expiring.join(" and ") || "your pantry staples"}, keeps cleanup civilized, and lands dinner before hanger wins.</p></div><div className="grid gap-5 sm:grid-cols-2"><IngredientGroup title="You have" items={meal.have} good/><IngredientGroup title="You need" items={meal.need.length?meal.need:["Nothing — a fridge miracle"]}/></div><div><h3 className="font-display text-xl font-bold">Let’s cook</h3><ol className="mt-4 space-y-4">{["Heat your cooking setup and get everything within arm’s reach.","Season and cook the main ingredients until deeply golden.","Warm the rice or tortillas and prep the bright, crunchy bits.","Pile it all together, finish with lemon, and eat immediately."].map((step,i)=><li key={step} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i+1}</span><p className="pt-1 text-sm">{step}</p></li>)}</ol></div><div className="rounded-2xl border border-border p-4"><b>Easy swap</b><p className="mt-1 text-sm text-muted-foreground">No broccoli? Use any sturdy green. Greek yogurt makes an excellent creamy sauce in a pinch.</p></div><div className="sticky bottom-0 flex gap-2 bg-card py-2"><Button variant="kitchen" size="kitchen" className="flex-1" onClick={()=>onAdd(meal)} disabled={!meal.need.length}><Plus/> Add missing</Button><Button variant="cream" size="kitchen" onClick={onSave}><Heart className={saved?"fill-primary text-primary":""}/></Button><Button variant="dark" size="kitchen">Cook this</Button></div></div></>}</DialogContent></Dialog>; }
function IngredientGroup({title,items,good}:{title:string;items:string[];good?:boolean}) { return <div><h3 className="mb-3 font-display text-xl font-bold">{title}</h3><ul className="space-y-2">{items.map(x=><li key={x} className="flex items-center gap-2 text-sm"><span className={`grid size-5 place-items-center rounded-full ${good?"bg-accent text-accent-foreground":"bg-secondary text-primary"}`}>{good?<Check className="size-3"/>:<Plus className="size-3"/>}</span>{x}</li>)}</ul></div>; }

function FlowDialog({ modal, setModal }: any) {
  const [stage,setStage]=useState(0); const close=()=>{setModal(null);setStage(0)};
  const auth = async (provider:"google"|"apple") => { await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin}); };
  return <Dialog open={!!modal} onOpenChange={o=>!o&&close()}><DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-[2rem]">
    {modal==="auth" && <div className="space-y-5"><DialogHeader><DialogTitle className="font-display text-3xl">Your fridge, everywhere.</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Sync your kitchen and share it with your household—or keep trying the app as a guest.</p><Button variant="dark" size="kitchen" className="w-full" onClick={()=>auth("apple")}><Apple/> Continue with Apple</Button><Button variant="cream" size="kitchen" className="w-full" onClick={()=>auth("google")}><span className="font-bold">G</span> Continue with Google</Button><Button variant="outline" size="kitchen" className="w-full">Continue with email</Button><button onClick={close} className="w-full text-sm font-bold text-primary">Keep exploring as a guest</button><p className="text-center text-xs text-muted-foreground">Guest mode stays on this device. You control what gets added and shared.</p></div>}
    {modal==="settings" && <SettingsPanel/>}
    {modal==="add" && <div className="space-y-5"><DialogHeader><DialogTitle className="font-display text-3xl">Add something good</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3">{([[Mic,"Say it","voice"],[Camera,"Scan receipt","receipt"],[ScanLine,"Scan barcode","barcode"],[ListChecks,"Bulk add","add"]] as const).map(([Icon,label,key])=><button key={label} onClick={()=>setModal(key)} className="app-card flex flex-col items-start gap-4 p-4 font-bold"><Icon className="size-6 text-primary"/>{label}</button>)}</div><ManualForm/></div>}
    {modal==="voice" && <SimulatedFlow type="voice" stage={stage} setStage={setStage} close={close}/>} 
    {modal==="receipt" && <SimulatedFlow type="receipt" stage={stage} setStage={setStage} close={close}/>} 
    {modal==="barcode" && <SimulatedFlow type="barcode" stage={stage} setStage={setStage} close={close}/>} 
  </DialogContent></Dialog>;
}

function ManualForm(){ return <div className="space-y-3"><b className="block">Or enter it manually</b><Input placeholder="Item name" className="h-12 rounded-xl"/><div className="grid grid-cols-2 gap-3"><Input placeholder="Quantity" className="h-12 rounded-xl"/><select className="h-12 rounded-xl border border-input bg-background px-3 text-sm"><option>Fridge</option><option>Freezer</option><option>Pantry</option><option>Snack drawer</option></select></div><div className="grid grid-cols-2 gap-3"><Input type="date" className="h-12 rounded-xl"/><Input placeholder="Category" className="h-12 rounded-xl"/></div><Input placeholder="Tags or notes" className="h-12 rounded-xl"/><Button variant="kitchen" size="kitchen" className="w-full"><Plus/> Add to inventory</Button></div>;}

function SimulatedFlow({type,stage,setStage,close}:any){const config:any={voice:{title:"Tell me what came home",icon:Mic,copy:"Try: Two chicken breasts in the fridge, a dozen eggs, almond milk, spinach, and frozen rice."},receipt:{title:"Scan your receipt",icon:Camera,copy:"Place the whole receipt in frame. We’ll expand names and group duplicates."},barcode:{title:"Scan a barcode",icon:ScanLine,copy:"Center the barcode inside the frame and hold still for a second."}};const {title,icon:Icon,copy}=config[type];return <div className="space-y-5"><DialogHeader><DialogTitle className="font-display text-3xl">{stage?"Nice haul. Check our work.":title}</DialogTitle></DialogHeader>{!stage?<><div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.5rem] bg-foreground text-background"><div className="absolute inset-6 rounded-2xl border-2 border-dashed border-background/50"/><div className="text-center"><Icon className="mx-auto size-12"/><p className="mt-3 max-w-xs px-6 text-sm opacity-70">{copy}</p></div>{type==="barcode"&&<div className="absolute inset-x-10 top-1/2 h-0.5 bg-primary shadow-[0_0_16px_var(--primary)]"/>}</div><Button variant="kitchen" size="kitchen" className="w-full" onClick={()=>setStage(1)}>{type==="voice"?<><Mic/>Start listening</>:<><Sparkles/>Simulate scan</>}</Button></>:<><div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground"><Sparkles className="mb-2 size-5"/><b>Parsed and tidied up</b><p className="opacity-75">Names expanded, duplicates grouped, sensible locations suggested.</p></div><div className="space-y-2">{(type==="barcode"?[["Organic almond milk","1 carton","Fridge"]]:[["Chicken breasts","2 pieces","Fridge"],["Large eggs","12","Fridge"],["Baby spinach","1 bag","Fridge"],["Frozen jasmine rice","1 pack","Freezer"]]).map((x:string[])=><div key={x[0]} className="app-card grid grid-cols-[1fr_auto] gap-2 p-3"><div><b className="block text-sm">{x[0]}</b><span className="text-xs text-muted-foreground">{x[1]} · {x[2]}</span></div><Button variant="ghost" size="icon"><Edit3/></Button></div>)}</div><Button variant="kitchen" size="kitchen" className="w-full" onClick={close}><Check/>Add everything</Button></>}</div>}

function SettingsPanel(){const [reminders,setReminders]=useState([true,true,false,true,true]);return <div className="space-y-6"><DialogHeader><DialogTitle className="font-display text-3xl">Settings</DialogTitle></DialogHeader>{["Profile","Household","Locations","Categories & tags"].map(x=><button key={x} className="flex w-full items-center justify-between border-b border-border py-3 text-left font-semibold">{x}<ChevronRight className="size-4"/></button>)}<div><b className="mb-3 block">Friendly nudges</b>{["Food expiring in 3 days","Food expiring tomorrow","Expired food summary","Household invite accepted","Weekly “use what you have” ideas"].map((x,i)=><label key={x} className="flex items-center justify-between py-2 text-sm"><span>{x}</span><Switch checked={reminders[i]} onCheckedChange={v=>setReminders(r=>r.map((x,j)=>j===i?v:x))}/></label>)}</div><div className="rounded-2xl bg-muted p-4"><Leaf className="mb-3 size-5 text-primary"/><b>Privacy, without the garnish</b><p className="mt-2 text-sm text-muted-foreground">Use the app without an account. Voice parsing is designed to stay private. Household sharing is optional, and you control every item you add.</p></div>{["Theme","Export inventory","Delete account"].map(x=><button key={x} className={`flex w-full items-center justify-between py-2 text-left text-sm font-semibold ${x==="Delete account"?"text-destructive":""}`}>{x}<ChevronRight className="size-4"/></button>)}</div>}
