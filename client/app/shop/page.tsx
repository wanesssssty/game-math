"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatSprite } from "@/components/CatSprite";
import { AuthRequired } from "@/components/auth-required";
import { SiteFrame } from "@/components/site-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  buyShopItem,
  fetchInventory,
  fetchShopCatalog,
  type CustomizationOption,
} from "@/lib/account-api";
import { ApiError } from "@/lib/api/client";
import { getOptionValue, isSkinOption } from "@/lib/avatar";
import { getRarityUi } from "@/lib/store-items";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const { isAuthenticated, user, patchUser } = useAuth();
  const [items, setItems] = useState<CustomizationOption[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuyingId, setIsBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setOwnedIds([]);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const [shopData, inventoryData] = await Promise.all([fetchShopCatalog(), fetchInventory()]);

        if (!active) return;

        const skins = shopData.items
          .filter(isSkinOption)
          .sort((a, b) => {
            const na = parseInt(a.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
            const nb = parseInt(b.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
            return na - nb;
          });
        setItems(skins);
        setOwnedIds(inventoryData.items.map((item) => item.customizationId));
      } catch (error) {
        if (!active) return;
        setMessage(
          error instanceof ApiError ? error.message : "Не вдалося завантажити магазин."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const status = useMemo(
    () =>
      `${user?.candyBalance ?? 0} цукерок • Скінів куплено: ${ownedIds.length}/${items.length || 0}`,
    [items.length, ownedIds.length, user?.candyBalance]
  );

  const onBuy = async (id: string) => {
    if (!isAuthenticated || ownedIds.includes(id) || isBuyingId) return;

    setIsBuyingId(id);
    setMessage("");

    try {
      const result = await buyShopItem(id);
      setOwnedIds((prev) => [...prev, result.customizationId]);
      patchUser({ candyBalance: result.candyBalance });
      setMessage("Скін успішно куплено.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Не вдалося купити скін.");
    } finally {
      setIsBuyingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <SiteFrame>
        <AuthRequired
          title="Магазин"
          description="Магазин відкривається після входу в акаунт, бо покупки списують цукерки з реального балансу."
        />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <section className="mb-4 rounded-2xl bg-slate-900/90 p-6 shadow">
        <h1 className="text-3xl font-black">Магазин скінів</h1>
        <p className="mt-2 text-sm text-slate-300">{status}</p>
        <p className="mt-1 text-sm text-slate-400">
          Заробляй цукерки в математичних режимах і відкривай нових котиків. Наведи на картинку —
          анімація.
        </p>
        {message ? <p className="mt-3 text-sm font-semibold text-cyan-100">{message}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="rounded-2xl bg-slate-900/90 p-6 text-sm text-slate-300">
            Завантажуємо каталог...
          </div>
        ) : null}
        {items.map((item) => {
          const alreadyOwned = ownedIds.includes(item.id);
          const canBuy = (user?.candyBalance ?? 0) >= item.price && !alreadyOwned;
          const rarityUi = getRarityUi(item.rarity);
          const src = getOptionValue(item);

          return (
            <Card key={item.id} className="bg-slate-900/90">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{item.name}</CardTitle>
                  <Badge variant="secondary">Скін</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex justify-center rounded-xl border border-slate-700 bg-slate-950/80 p-2">
                  <CatSprite size={112} src={src} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="font-bold text-cyan-300">{item.price} цукерок</p>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-xs font-bold",
                      rarityUi.className
                    )}
                  >
                    {rarityUi.label}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <button
                  className={cn(buttonVariants(), "w-full", !canBuy && "opacity-60")}
                  disabled={!canBuy || isBuyingId === item.id}
                  onClick={() => void onBuy(item.id)}
                  type="button"
                >
                  {alreadyOwned
                    ? "Уже в інвентарі"
                    : isBuyingId === item.id
                      ? "Купуємо..."
                      : "Купити"}
                </button>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full rounded-xl border-slate-600 text-slate-100"
                  )}
                  href={`/avatar?item=${item.id}`}
                >
                  Переглянути на кішці
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </SiteFrame>
  );
}
