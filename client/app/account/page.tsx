"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthRequired } from "@/components/auth-required";
import { CatAvatar } from "@/components/CatAvatar";
import { SiteFrame } from "@/components/site-frame";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAccount, type AccountData, type ApiOperationType } from "@/lib/account-api";
import { DEFAULT_AVATAR_CONFIG, equippedToConfig } from "@/lib/avatar";
import { ApiError } from "@/lib/api/client";
import { getLocalProgressSessions } from "@/lib/progress-storage";
import { getCustomizationUi, getRarityUi } from "@/lib/store-items";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const operationMeta: Record<ApiOperationType, { label: string; icon: string; sign: string }> = {
  ADD: { label: "Додавання", icon: "➕", sign: "+" },
  SUB: { label: "Віднімання", icon: "➖", sign: "-" },
  MUL: { label: "Множення", icon: "✖️", sign: "×" },
  DIV: { label: "Ділення", icon: "➗", sign: "÷" },
};

export default function AccountPage() {
  const { isAuthenticated, patchUser, user } = useAuth();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [localSessionsCount, setLocalSessionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setAccount(null);
      setIsLoading(false);
      setError("");
      return;
    }

    let active = true;

    const loadAccount = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchAccount();

        if (!active) return;

        setAccount(data);
        setLocalSessionsCount(getLocalProgressSessions().length);
        patchUser({
          name: data.user.name,
          email: data.user.email,
          candyBalance: data.user.candyBalance,
        });
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Не вдалося завантажити дані акаунту."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadAccount();

    return () => {
      active = false;
    };
  }, [isAuthenticated, patchUser]);

  const avatarConfig = useMemo(
    () => (account ? equippedToConfig(account.equipped) : DEFAULT_AVATAR_CONFIG),
    [account]
  );

  const progressSummary = useMemo(() => {
    const empty = {
      ADD: { totalSolved: 0, bestStreak: 0, maxLevel: 0 },
      SUB: { totalSolved: 0, bestStreak: 0, maxLevel: 0 },
      MUL: { totalSolved: 0, bestStreak: 0, maxLevel: 0 },
      DIV: { totalSolved: 0, bestStreak: 0, maxLevel: 0 },
    };

    for (const row of account?.progress ?? []) {
      empty[row.operationType].totalSolved += row.highScore;
      empty[row.operationType].bestStreak = Math.max(
        empty[row.operationType].bestStreak,
        row.bestStreak
      );
      empty[row.operationType].maxLevel = Math.max(empty[row.operationType].maxLevel, row.level);
    }

    return empty;
  }, [account?.progress]);

  if (!isAuthenticated) {
    return (
      <SiteFrame>
        <AuthRequired
          title="Акаунт"
          description="Увійди, щоб бачити баланс, прогрес у тестах, інвентар і останні помилки."
        />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <section className="grid gap-6">
        <Card className="rounded-3xl border-indigo-300/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 shadow-xl shadow-black/20">
          <CardHeader className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Центр акаунту</Badge>
                <Badge variant="secondary">Реальний API</Badge>
                <Badge variant="secondary">Прогрес і баланс</Badge>
              </div>
              <CardTitle className="text-3xl font-black md:text-4xl">
                {account?.user.name || user?.name || "Гравець"} , твій профіль готовий до гри
              </CardTitle>
              <p className="max-w-3xl text-indigo-100/85">
                Тут зібрано все головне: баланс цукерок, тренувальний прогрес, куплені предмети
                та останні помилки для повторення.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-indigo-300/20 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-300">Поточний акаунт</p>
              <p className="text-lg font-bold text-slate-100">{account?.user.email || user?.email}</p>
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">Баланс</p>
                <p className="mt-2 text-3xl font-black text-amber-100">
                  {account?.user.candyBalance ?? user?.candyBalance ?? 0}
                </p>
                <p className="text-sm text-amber-100/80">Цукерок доступно для магазину</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  className={cn(
                    buttonVariants(),
                    "rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
                  )}
                  href="/shop"
                >
                  В магазин
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-xl border-slate-700 text-slate-100"
                  )}
                  href="/test"
                >
                  Пройти тест
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
            <CardContent className="py-8 text-sm text-slate-300">Завантажуємо дані акаунту...</CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="rounded-2xl border-rose-400/30 bg-rose-500/10 shadow-xl shadow-black/20">
            <CardContent className="py-6 text-sm font-semibold text-rose-100">{error}</CardContent>
          </Card>
        ) : null}

        {account ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black">Інвентар</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-cyan-100">{account.inventory.length}</p>
                  <p className="mt-2 text-sm text-slate-300">Куплених предметів у колекції</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black">Котики</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-cyan-100">{account.unlockedCats.length}</p>
                  <p className="mt-2 text-sm text-slate-300">Розблокованих аватарів</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black">Помилки</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-cyan-100">{account.recentErrors.length}</p>
                  <p className="mt-2 text-sm text-slate-300">Останніх прикладів для повторення</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black">Локальна історія</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-cyan-100">{localSessionsCount}</p>
                  <p className="mt-2 text-sm text-slate-300">Збережених браузером гостьових сесій</p>
                </CardContent>
              </Card>
            </section>

            <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-2xl font-black">Мій котик</CardTitle>
                <Link
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-xl bg-gradient-to-r from-cyan-300 to-pink-300 font-bold text-slate-900"
                  )}
                  href="/avatar"
                >
                  Налаштувати
                </Link>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="overflow-hidden rounded-2xl border border-slate-700 shadow-lg">
                  <CatAvatar animateOnHover size={150} skinSrc={avatarConfig.skinSrc} />
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  {account.selectedCat ? (
                    <>
                      <p className="text-xl font-black text-slate-100">{account.selectedCat.name}</p>
                      <p className="text-sm text-slate-300">
                        Рідкість: {getRarityUi(account.selectedCat.rarity).label}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-300">Обери стиль шерсті, очей та аксесуарів.</p>
                  )}
                  <p className="text-sm text-slate-400">
                    Екіпіровано предметів: {account.equipped.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Профіль і екіпіровка</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-sm text-slate-300">Активний котик</p>
                    {account.selectedCat ? (
                      <>
                        <p className="mt-2 text-2xl font-black text-slate-100">
                          {account.selectedCat.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          Рідкість: {getRarityUi(account.selectedCat.rarity).label}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-300">
                        Поки що вибраний кіт не встановлений.
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="font-semibold text-slate-100">Активні предмети</p>
                    {account.equipped.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-300">
                        Ще нічого не екіпіровано. Купи предмет у магазині та додай його до образу.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {account.equipped.map((item) => {
                          const typeUi = getCustomizationUi(item.customization);
                          return (
                            <li
                              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                              key={item.id}
                            >
                              <span>
                                {typeUi.emoji} {item.customization.name}
                              </span>
                              <span className="text-slate-400">{typeUi.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Прогрес по темах</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(operationMeta).map(([operation, meta]) => {
                    const summary = progressSummary[operation as ApiOperationType];
                    return (
                      <div
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                        key={operation}
                      >
                        <p className="text-lg font-black text-slate-100">
                          {meta.icon} {meta.label}
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-300">
                          <p>Розв'язано правильно: {summary.totalSolved}</p>
                          <p>Найкращий стрік: {summary.bestStreak}</p>
                          <p>Найвищий рівень: {summary.maxLevel || "ще не відкрито"}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-black">Останні предмети</CardTitle>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-xl border-slate-700 text-slate-100"
                    )}
                    href="/inventory"
                  >
                    Відкрити інвентар
                  </Link>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {account.inventory.length === 0 ? (
                    <p className="text-sm text-slate-300">
                      Інвентар поки порожній. Пройди кілька задач, зароби цукерки та купи перший
                      предмет.
                    </p>
                  ) : (
                    account.inventory.slice(0, 4).map((item) => {
                      const typeUi = getCustomizationUi(item.option);
                      const rarityUi = getRarityUi(item.option.rarity);

                      return (
                        <div
                          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                          key={item.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-2xl">{typeUi.emoji}</p>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-1 text-xs font-bold",
                                rarityUi.className
                              )}
                            >
                              {rarityUi.label}
                            </span>
                          </div>
                          <p className="mt-3 text-lg font-black text-slate-100">{item.option.name}</p>
                          <p className="mt-1 text-sm text-slate-300">{typeUi.description}</p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Останні помилки</CardTitle>
                </CardHeader>
                <CardContent>
                  {account.recentErrors.length === 0 ? (
                    <p className="text-sm text-slate-300">
                      Поки що без помилок. Це означає, що останні задачі пройшли дуже добре.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {account.recentErrors.map((entry) => (
                        <li
                          className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4"
                          key={entry.id}
                        >
                          <p className="font-semibold text-rose-100">
                            {operationMeta[entry.operationType].label}: {entry.number1}{" "}
                            {operationMeta[entry.operationType].sign} {entry.number2}
                          </p>
                          <p className="mt-1 text-sm text-rose-100/85">
                            Твоя відповідь: {entry.userAnswer} • правильна: {entry.correctAnswer}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        ) : null}
      </section>
    </SiteFrame>
  );
}
