import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";

import { InventoryList } from "@/components/kitchen/InventoryList";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useKitchen } from "@/lib/kitchen/store";

export const Route = createFileRoute("/kitchen")({
  ssr: false,
  component: KitchenPage,
});

function KitchenPage() {
  const reset = useKitchen((s) => s.resetAll);
  const count = useKitchen((s) => s.inventory.length);

  return (
    <div className="min-h-[100dvh] pb-24">
      <header className="flex items-end justify-between px-4 pb-3 pt-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Kitchen</h1>
          <p className="text-sm text-muted-foreground">
            {count} items · grouped by how honest we are about them
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Profile & settings</SheetTitle>
              <SheetDescription>
                Household, reminders, and account preferences live here.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3 text-sm">
              <p className="text-muted-foreground">
                Multi-user households and notification preferences are part of the full app.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  toast.success("Kitchen reset to sample data.");
                }}
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Reset sample data
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      <main className="px-4">
        <InventoryList />
      </main>
    </div>
  );
}
