import { createFileRoute } from "@tanstack/react-router";

import { ShoppingList } from "@/components/shop/ShoppingList";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  return (
    <div className="min-h-[100dvh] pb-24">
      <header className="px-4 pb-3 pt-4">
        <h1 className="font-display text-2xl font-semibold">Shopping</h1>
        <p className="text-sm text-muted-foreground">
          Saved meals minus what's in your kitchen. Updated automatically.
        </p>
      </header>
      <main className="px-4">
        <ShoppingList />
      </main>
    </div>
  );
}
