"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatSprite } from "@/components/CatSprite";
import { AuthRequired } from "@/components/auth-required";
import { SiteFrame } from "@/components/site-frame";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchInventory, type InventoryItem } from "@/lib/account-api";
import { ApiError } from "@/lib/api/client";
import { getOptionValue, isSkinOption } from "@/lib/avatar";
import { getCustomizationUi, getRarityUi } from "@/lib/store-items";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadInventory = async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const data = await fetchInventory();

        if (!active) return;

        setItems(data.items);
      } catch (error) {
        if (!active) return;
        setMessage(
          error instanceof ApiError ? error.message : "Не вдалося завантажити інвентар."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadInventory();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const { skins, other } = useMemo(() => {
    const skinItems: InventoryItem[] = [];
    const otherItems: InventoryItem[] = [];
    for (const item of items) {
      if (isSkinOption(item.option)) {
        skinItems.push(item);
      } else {
        otherItems.push(item);
      }
    }
    skinItems.sort((a, b) => {
      const na = parseInt(a.option.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
      const nb = parseInt(b.option.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
      return na - nb;
    });
    return { skins: skinItems, other: otherItems };
  }, [items]);

  if (!isAuthenticated) {
    return (
      <SiteFrame>
        <AuthRequired
          title="Інвентар"
          description="Тут зберігаються усі твої куплені скіни та прикраси. Увійди в акаунт, щоб бачити свою колекцію."
          perks={[
            "Усі куплені котики в одному місці",
            "Швидко одягни улюблений скін",
            "Показуй нагороди друзям",
          ]}
          playHref="/test"
          playLabel="Заробити цукерки"
        />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <section className="mb-4 rounded-2xl bg-slate-900/90 p-6 shadow">
        <h1 className="text-3xl font-black">Інвентар</h1>
        <p className="mt-2 text-sm text-slate-300">
          Куплені скіни котиків. Наведи на картинку — анімація. Одягнути можна на сторінці{" "}
          <Link className="font-semibold text-cyan-300 underline" href="/avatar">
            Мій котик
          </Link>
          .
        </p>
        {message ? <p className="mt-3 text-sm font-semibold text-cyan-100">{message}</p> : null}
      </section>

      {isLoading ? (
        <div className="rounded-2xl bg-slate-900/90 p-6 text-sm text-slate-300">Завантажуємо інвентар...</div>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/90 p-6 text-sm text-slate-300">
          Поки що жодного предмета не куплено.{" "}
          <Link className="text-cyan-300 underline" href="/shop">
            Перейти в магазин
          </Link>
        </div>
      ) : null}

      {!isLoading && skins.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-black text-slate-100">Скіни ({skins.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skins.map((item) => {
              const rarityUi = getRarityUi(item.option.rarity);
              const src = getOptionValue(item.option);

              return (
                <Card key={item.id} className="bg-slate-900/90">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.option.name}</CardTitle>
                    <Badge variant="secondary">Скін</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center rounded-xl border border-slate-700 bg-slate-950/80 p-2">
                      <CatSprite animateOnHover size={112} src={src} />
                    </div>
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-bold",
                        rarityUi.className
                      )}
                    >
                      {rarityUi.label}
                    </span>
                  </CardContent>
                  <CardFooter>
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-xl")}
                      href="/avatar"
                    >
                      Одягнути
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {!isLoading && other.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-black text-slate-100">Інше ({other.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {other.map((item) => {
              const typeUi = getCustomizationUi(item.option);
              const rarityUi = getRarityUi(item.option.rarity);

              return (
                <Card key={item.id} className="bg-slate-900/90">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{item.option.name}</CardTitle>
                      <Badge variant="secondary">{typeUi.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 grid h-24 place-items-center rounded-xl bg-slate-800 text-4xl">
                      {typeUi.emoji}
                    </div>
                    <p className="text-sm text-slate-300">{typeUi.description}</p>
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-bold",
                        rarityUi.className
                      )}
                    >
                      {rarityUi.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}
    </SiteFrame>
  );
}
