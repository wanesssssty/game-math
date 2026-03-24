"use client";

import { useMemo, useState } from "react";
import { SiteFrame } from "@/components/site-frame";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storeItems } from "@/lib/store-items";

export default function ShopPage() {
  const [coins, setCoins] = useState(120);
  const [owned, setOwned] = useState<string[]>([]);

  const status = useMemo(
    () => `${coins} монет • Предметів: ${owned.length}/${storeItems.length}`,
    [coins, owned.length]
  );

  const buy = (id: string, price: number) => {
    if (owned.includes(id) || coins < price) return;
    setOwned((prev) => [...prev, id]);
    setCoins((prev) => prev - price);
  };

  return (
    <SiteFrame>
      <section className="mb-4 rounded-2xl bg-slate-900/90 p-6 shadow">
        <h1 className="text-3xl font-black">Магазин</h1>
        <p className="mt-2 text-sm text-slate-300">{status}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {storeItems.map((item) => {
          const alreadyOwned = owned.includes(item.id);
          const canBuy = coins >= item.price && !alreadyOwned;
          return (
            <Card key={item.id} className="bg-slate-900/90">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 grid h-24 place-items-center rounded-xl bg-slate-800 text-4xl">
                  {item.emoji}
                </div>
                <p className="text-sm text-slate-300">{item.description}</p>
                <p className="mt-2 font-bold text-cyan-300">{item.price} монет</p>
              </CardContent>
              <CardFooter>
                <button
                  className={cn(
                    buttonVariants(),
                    "w-full",
                    !canBuy && "opacity-60"
                  )}
                  onClick={() => buy(item.id, item.price)}
                  type="button"
                >
                  {alreadyOwned ? "Куплено" : "Купити"}
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </SiteFrame>
  );
}
