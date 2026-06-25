"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GuestPromoBanner } from "@/components/guest-promo-banner";
import { SiteFrame } from "@/components/site-frame";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAccount, type AccountData, type ApiOperationType } from "@/lib/account-api";
import { ApiError } from "@/lib/api/client";
import { getCustomizationUi } from "@/lib/store-items";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/addition",
    title: "Додавання",
    text: "Збирай числа разом і тренуй швидке мислення.",
    bg: "radial-gradient(circle at 20% 20%,#fff5,transparent 28%), linear-gradient(135deg,#0ea5e9,#38bdf8)",
    icon: "➕",
  },
  {
    href: "/subtraction",
    title: "Віднімання",
    text: "Віднімай точно та знаходь правильний результат.",
    bg: "radial-gradient(circle at 20% 20%,#fff5,transparent 28%), linear-gradient(135deg,#ec4899,#f472b6)",
    icon: "➖",
  },
  {
    href: "/multiplication",
    title: "Множення",
    text: "Таблиця множення у форматі міні-гри.",
    bg: "radial-gradient(circle at 20% 20%,#fff5,transparent 28%), linear-gradient(135deg,#10b981,#34d399)",
    icon: "✖️",
  },
  {
    href: "/division",
    title: "Ділення",
    text: "Вчись ділити приклади без залишку.",
    bg: "radial-gradient(circle at 20% 20%,#fff5,transparent 28%), linear-gradient(135deg,#8b5cf6,#a78bfa)",
    icon: "➗",
  },
];

const benefits = [
  {
    title: "Миттєвий фідбек",
    text: "Кожна відповідь одразу перевіряється — ти одразу бачиш, чи молодець.",
  },
  {
    title: "Навчання через гру",
    text: "Цукерки, інвентар і магазин мотивують проходити більше завдань регулярно.",
  },
  {
    title: "Видимий прогрес",
    text: "У профілі видно сильні сторони, баланс, останні помилки та куплені предмети.",
  },
];

const parentFeatures = [
  "Прогрес по темах і рівнях в одному місці",
  "Журнал помилок для повторення слабких тем",
  "Баланс і нагороди як додаткова мотивація",
];

const operationMeta: Record<ApiOperationType, string> = {
  ADD: "Додавання",
  SUB: "Віднімання",
  MUL: "Множення",
  DIV: "Ділення",
};

export default function Home() {
  const [mode, setMode] = useState("all");
  const { isAuthenticated, user } = useAuth();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [accountError, setAccountError] = useState("");

  const visibleCards =
    mode === "all"
      ? cards
      : mode === "basic"
        ? cards.filter((card) => card.href === "/addition" || card.href === "/subtraction")
        : cards.filter((card) => card.href === "/multiplication" || card.href === "/division");

  useEffect(() => {
    if (!isAuthenticated) {
      setAccount(null);
      setAccountError("");
      return;
    }

    let active = true;

    const loadAccount = async () => {
      try {
        const data = await fetchAccount();
        if (active) {
          setAccount(data);
          setAccountError("");
        }
      } catch (error) {
        if (active) {
          setAccount(null);
          setAccountError(
            error instanceof ApiError ? error.message : "Не вдалося завантажити твій прогрес."
          );
        }
      }
    };

    void loadAccount();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const progressSummary = useMemo(() => {
    if (!account) return null;

    const bestOperation = account.progress.reduce<{
      operationType: ApiOperationType;
      score: number;
    } | null>((best, item) => {
      const score = item.highScore + item.bestStreak;
      if (!best || score > best.score) {
        return { operationType: item.operationType, score };
      }
      return best;
    }, null);

    return {
      solved: account.progress.reduce((sum, item) => sum + item.highScore, 0),
      bestOperation: bestOperation ? operationMeta[bestOperation.operationType] : "Ще формується",
      errorCount: account.recentErrors.length,
    };
  }, [account]);

  const featuredInventory = account?.inventory.slice(0, 3) ?? [];

  return (
    <SiteFrame>
      <section className="relative overflow-hidden rounded-3xl border border-indigo-300/30 bg-linear-to-br from-indigo-950 via-blue-950 to-fuchsia-950 p-6 shadow-2xl shadow-black/40 md:p-10">
        <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-pink-300/20 blur-2xl" />

        <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Навчання через гру</Badge>
              <Badge variant="secondary">Для дітей 6+</Badge>
              <Badge variant="secondary">Українською</Badge>
              {isAuthenticated ? <Badge variant="secondary">Мій профіль</Badge> : null}
            </div>
            <h1 className="max-w-[18ch] text-3xl leading-tight font-black md:text-5xl">
              Math Paws — математика, яку хочеться проходити
            </h1>
            <p className="mt-3 max-w-[58ch] text-indigo-100/90 md:text-lg">
              Веселий тренажер з додавання, віднімання, множення і ділення. Короткі місії,
              цукерки за правильні відповіді та котики в магазині.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className={cn(
                  buttonVariants(),
                  "h-10 rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/30"
                )}
                href="/test"
              >
                Почати тест
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 rounded-xl border border-indigo-200/40 px-4 font-bold text-slate-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
                )}
                href={isAuthenticated ? "/account" : "/addition"}
              >
                {isAuthenticated ? "Мій профіль" : "Обрати тему"}
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-indigo-200/20 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70">Місії</p>
                <p className="mt-2 text-lg font-black text-slate-50">10 задач за місію</p>
              </div>
              <div className="rounded-2xl border border-indigo-200/20 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70">Нагорода</p>
                <p className="mt-2 text-lg font-black text-slate-50">Цукерки за правильні відповіді</p>
              </div>
              <div className="rounded-2xl border border-indigo-200/20 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70">Профіль</p>
                <p className="mt-2 text-lg font-black text-slate-50">Баланс, інвентар, прогрес</p>
              </div>
            </div>
          </div>
          <div
            className="grid min-h-56 place-items-center rounded-2xl border border-indigo-200/30 bg-linear-to-br from-indigo-900/70 to-blue-900/70 text-5xl shadow-lg"
            aria-hidden
          >
            🐱✨🔢
          </div>
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="mt-6">
          <GuestPromoBanner />
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Швидкий старт</Badge>
              <Badge variant="secondary">Обери тему</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              Почни з формату, який потрібен саме зараз
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList variant="line" className="mb-3">
                <TabsTrigger value="all">Всі теми</TabsTrigger>
                <TabsTrigger value="basic">Базові</TabsTrigger>
                <TabsTrigger value="advanced">Складніші</TabsTrigger>
              </TabsList>
              <TabsContent value={mode} className="grid gap-4 sm:grid-cols-2">
                {visibleCards.map((card) => (
                  <Card
                    className="rounded-2xl border-indigo-300/20 bg-slate-950/70 shadow-xl shadow-black/20"
                    key={card.href}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl font-black">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="mb-3 grid h-34 place-items-center rounded-xl text-3xl"
                        style={{ backgroundImage: card.bg }}
                      >
                        {card.icon}
                      </div>
                      <p className="mt-2 text-sm text-indigo-100/85">{card.text}</p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        className={cn(
                          buttonVariants(),
                          "mt-1 h-10 rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/30"
                        )}
                        href={card.href}
                      >
                        Грати
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Змішаний тест</Badge>
              <Badge variant="secondary">Готовий маршрут</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              Хочеш швидко перевірити себе по всіх темах?
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-indigo-100/85">
              Змішаний тест поєднує додавання, віднімання, множення і ділення в одній серії. Це
              найшвидший спосіб побачити сильні й слабкі теми.
            </p>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-slate-100">Що ти отримаєш</p>
              <p className="mt-2 text-sm text-slate-300">
                Підказки, миттєву перевірку, цукерки за правильні відповіді й список помилок для
                повторення.
              </p>
            </div>
            <Link
              className={cn(
                buttonVariants(),
                "w-fit rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
              )}
              href="/test"
            >
              Почати змішаний тест
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Прогрес дня</Badge>
              <Badge variant="secondary">Мій акаунт</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              {isAuthenticated
                ? `Повертаємось до навчання, ${user?.name || "друже"}`
                : "Увійди — і відкриється магазин, інвентар та твій прогрес"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isAuthenticated ? (
              <>
                {accountError ? (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-100">
                    {accountError}
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Баланс</p>
                    <p className="mt-2 text-2xl font-black text-amber-200">
                      {account?.user.candyBalance ?? user?.candyBalance ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Розв'язано</p>
                    <p className="mt-2 text-2xl font-black text-cyan-200">
                      {progressSummary?.solved ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Сильна тема</p>
                    <p className="mt-2 text-lg font-black text-emerald-200">
                      {progressSummary?.bestOperation ?? "Ще формується"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="font-semibold text-slate-100">Мета на сьогодні</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-300">
                    <p>
                      {progressSummary && progressSummary.solved >= 10
                        ? "10+ правильних відповідей уже є. Можна переходити до складнішої теми."
                        : "Зроби 10 правильних відповідей, щоб закріпити тему і заробити більше цукерок."}
                    </p>
                    <p>
                      {progressSummary && progressSummary.errorCount > 0
                        ? `У тебе є ${progressSummary.errorCount} помилок для повторення.`
                        : "Спробуй пройти змішаний тест без помилок."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4">
                <p className="text-indigo-100/85">
                  Після входу ти побачиш свої цукерки, прогрес у тестах, інвентар і помилки, які
                  варто повторити. А поки що — просто грай і заробляй нагороди!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className={cn(
                      buttonVariants(),
                      "w-fit rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
                    )}
                    href="/login"
                  >
                    Створити акаунт
                  </Link>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-fit rounded-xl border-slate-700 text-slate-100"
                    )}
                    href="/test"
                  >
                    Почати тест
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Нагороди</Badge>
              <Badge variant="secondary">Магазин</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              Баланс потрібен не лише для цифри
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-indigo-100/85">
              Цукерки перетворюють правильні відповіді на видиму нагороду: нові предмети,
              кастомізацію профілю та відчуття прогресу.
            </p>
            {featuredInventory.length > 0 ? (
              <div className="grid gap-3">
                {featuredInventory.map((item) => {
                  const ui = getCustomizationUi(item.option);
                  return (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
                      key={item.id}
                    >
                      <div>
                        <p className="font-semibold text-slate-100">
                          {ui.emoji} {item.option.name}
                        </p>
                        <p className="text-sm text-slate-300">{ui.label}</p>
                      </div>
                      <Badge variant="secondary">Уже відкрито</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                Поки що інвентар порожній. Пройди кілька місій і відкрий перший предмет у магазині.
              </div>
            )}
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-fit rounded-xl border-slate-700 text-slate-100"
              )}
              href={isAuthenticated ? "/shop" : "/login"}
            >
              {isAuthenticated ? "Перейти в магазин" : "Увійти для магазину"}
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {benefits.map((item) => (
          <Card
            className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20"
            key={item.title}
          >
            <CardHeader>
              <CardTitle className="text-xl font-black">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-100/85">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Для батьків</Badge>
              <Badge variant="secondary">Зрозумілий контроль</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              Що дає платформа дорослому
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-indigo-100/85">
              {parentFeatures.map((item) => (
                <li
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-300/20 bg-gradient-to-r from-cyan-950 via-sky-950 to-indigo-950 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Готово до старту</Badge>
              <Badge variant="secondary">Наступний крок</Badge>
            </div>
            <CardTitle className="text-2xl font-black md:text-3xl">
              Почати можна просто зараз
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-indigo-100/90">
              Обери тему, пройди змішаний тест або відкрий свій акаунт, щоб бачити баланс,
              інвентар і прогрес по всіх математичних місіях.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className={cn(
                  buttonVariants(),
                  "rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
                )}
                href="/addition"
              >
                Почати тренування
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-xl border-indigo-200/40 px-4 font-bold text-slate-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
                )}
                href={isAuthenticated ? "/account" : "/test"}
              >
                {isAuthenticated ? "Мій профіль" : "Подивитись тест"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteFrame>
  );
}
