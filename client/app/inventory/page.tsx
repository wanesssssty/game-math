"use client";

import { useMemo, useState } from "react";
import { SiteFrame } from "@/components/site-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storeItems } from "@/lib/store-items";

export default function InventoryPage() {
  const [owned] = useState<string[]>(["hat", "medal"]);

  const visibleItems = useMemo(
    () => storeItems.filter((item) => owned.includes(item.id)),
    [owned]
  );

  return (
    <SiteFrame>
      <section className="mb-4 rounded-2xl bg-slate-900/90 p-6 shadow">
        <h1 className="text-3xl font-black">Інвентар</h1>
        <p className="mt-2 text-sm text-slate-300">
          Тут зберігаються предмети, які ти вже придбав.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <Card key={item.id} className="bg-slate-900/90">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 grid h-24 place-items-center rounded-xl bg-slate-800 text-4xl">
                {item.emoji}
              </div>
              <p className="text-sm text-slate-300">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteFrame>
  );
}
