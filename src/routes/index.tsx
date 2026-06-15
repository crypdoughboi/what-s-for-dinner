import { createFileRoute } from "@tanstack/react-router";

import { MealDeck } from "@/components/deck/MealDeck";
import { ClientOnly } from "@/components/shell/ClientOnly";

export const Route = createFileRoute("/")({
  ssr: false,
  component: DeckPage,
});

function DeckPage() {
  return (
    <ClientOnly fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <MealDeck />
    </ClientOnly>
  );
}

