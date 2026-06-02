"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { AuthRequired } from "@/components/auth-required";
import { CatSprite } from "@/components/CatSprite";
import { SiteFrame } from "@/components/site-frame";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAccount,
  fetchShopCatalog,
  updateAvatar,
  type CustomizationOption,
} from "@/lib/account-api";
import { ApiError } from "@/lib/api/client";
import {
  DEFAULT_AVATAR_CONFIG,
  equippedToConfig,
  getOptionValue,
  isSkinOption,
  previewConfigForOption,
  type AvatarConfig,
} from "@/lib/avatar";
import { getRarityUi } from "@/lib/store-items";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export default function AvatarPage() {
  return (
    <Suspense
      fallback={
        <SiteFrame>
          <p className="text-sm text-slate-300">Завантажуємо редактор аватара...</p>
        </SiteFrame>
      }
    >
      <AvatarPageContent />
    </Suspense>
  );
}

function AvatarPageContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("item");
  const { isAuthenticated, user } = useAuth();

  const [skins, setSkins] = useState<CustomizationOption[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [selectedSkinId, setSelectedSkinId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [account, shop] = await Promise.all([fetchAccount(), fetchShopCatalog()]);
      const skinItems = shop.items.filter(isSkinOption).sort((a, b) => {
        const na = parseInt(a.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
        const nb = parseInt(b.imageUrl.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
        return na - nb;
      });
      setSkins(skinItems);
      setOwnedIds(new Set(account.inventory.map((i) => i.customizationId)));
      const initial = equippedToConfig(account.equipped);
      setConfig(initial);

      const equippedSkin = account.equipped.find((r) => isSkinOption(r.customization));
      setSelectedSkinId(equippedSkin?.customizationId);

      if (highlightId) {
        const item = skinItems.find((o) => o.id === highlightId);
        if (item) {
          setSelectedSkinId(item.id);
          setConfig(previewConfigForOption(initial, item));
        }
      }
    } catch (loadError) {
      setError(
        loadError instanceof ApiError ? loadError.message : "Не вдалося завантажити дані кастомізації."
      );
    } finally {
      setIsLoading(false);
    }
  }, [highlightId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    void loadData();
  }, [isAuthenticated, loadData]);

  const isOwned = (id: string) => ownedIds.has(id);

  const onSelect = (option: CustomizationOption) => {
    if (!isOwned(option.id)) return;
    setSelectedSkinId(option.id);
    setConfig(previewConfigForOption(config, option));
    setMessage("");
  };

  const onPreview = (option: CustomizationOption) => {
    setSelectedSkinId(option.id);
    setConfig(previewConfigForOption(config, option));
    setMessage("");
  };

  const onSave = async () => {
    if (!selectedSkinId || !isOwned(selectedSkinId)) {
      setError("Спочатку купи скін у магазині та обери його тут.");
      return;
    }
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      await updateAvatar({ skin: config.skinSrc });
      setMessage("Збережено! Твій котик оновлений.");
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : "Не вдалося зберегти образ.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SiteFrame>
        <AuthRequired
          title="Мій котик"
          description="Увійди в акаунт, щоб обирати скіни для свого котика."
        />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <section className="mb-6">
        <h1 className="text-3xl font-black">Мій котик</h1>
        <p className="mt-2 text-sm text-slate-300">
          Обери куплений скін і збережи. Баланс: {user?.candyBalance ?? 0} цукерок. Покупка — у{" "}
          <Link className="font-semibold text-cyan-300 underline" href="/shop">
            магазині
          </Link>
          .
        </p>
      </section>

      {isLoading ? (
        <Card className="rounded-2xl bg-slate-900/90">
          <CardContent className="py-10 text-sm text-slate-300">Завантажуємо скіни...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </p>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,300px)_1fr]">
          <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90">
            <CardHeader>
              <CardTitle className="text-xl font-black">Прев&apos;ю</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
                <CatSprite animateAlways size={250} src={config.skinSrc} />
              </div>
              <Button
                className="w-full rounded-xl"
                disabled={isSaving || !selectedSkinId || !isOwned(selectedSkinId)}
                onClick={() => void onSave()}
                type="button"
              >
                {isSaving ? "Зберігаємо..." : "Зберегти"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90">
            <CardHeader>
              <CardTitle className="text-xl font-black">Скіни ({skins.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {skins.map((item) => {
                  const owned = isOwned(item.id);
                  const isSelected = selectedSkinId === item.id;
                  const rarityUi = getRarityUi(item.rarity);
                  const src = getOptionValue(item);

                  return (
                    <div
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl border p-3",
                        isSelected ? "border-cyan-400 ring-2 ring-cyan-400/40" : "border-slate-700",
                        !owned && "opacity-90"
                      )}
                      key={item.id}
                    >
                      <button
                        className="flex w-full flex-col items-center gap-2"
                        onClick={() => (owned ? onSelect(item) : onPreview(item))}
                        type="button"
                      >
                        <CatSprite animateOnHover size={96} src={src} />
                        {!owned ? (
                          <span className="absolute right-2 top-2 rounded-full bg-slate-900/90 p-1 text-amber-200">
                            <Lock className="size-3.5" />
                          </span>
                        ) : null}
                        <span className="text-center text-xs font-semibold text-slate-100">{item.name}</span>
                        {owned ? (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                              rarityUi.className
                            )}
                          >
                            {rarityUi.label}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-200">{item.price} 🍬</span>
                        )}
                      </button>
                      {!owned ? (
                        <Link
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "w-full rounded-lg border-slate-600 text-xs text-slate-100"
                          )}
                          href={`/shop?item=${item.id}`}
                        >
                          У магазин
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </SiteFrame>
  );
}
