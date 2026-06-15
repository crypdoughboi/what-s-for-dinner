import { Link, useRouterState } from "@tanstack/react-router";
import { Layers, Plus, ShoppingBag, Refrigerator } from "lucide-react";

const TABS = [
  { to: "/", label: "Deck", icon: Layers },
  { to: "/add", label: "Add", icon: Plus },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/kitchen", label: "Kitchen", icon: Refrigerator },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`}
                  strokeWidth={2.2}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
