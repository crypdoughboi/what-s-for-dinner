import { createFileRoute } from "@tanstack/react-router";

import { MealDeck } from "@/components/deck/MealDeck";

export const Route = createFileRoute("/")({
  ssr: false,
  component: DeckPage,
});

function DeckPage() {
  return <MealDeck />;
}
