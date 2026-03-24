"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteFrame } from "@/components/site-frame";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Home() {
  const [mode, setMode] = useState("all");
  const visibleCards =
    mode === "all"
      ? cards
      : mode === "basic"
        ? cards.filter((card) => card.href === "/addition" || card.href === "/subtraction")
        : cards.filter((card) => card.href === "/multiplication" || card.href === "/division");

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
            </div>
            <h1 className="max-w-[18ch] text-3xl leading-tight font-black md:text-5xl">
              Math Paws — математика, яку хочеться проходити
            </h1>
            <p className="mt-3 max-w-[58ch] text-indigo-100/90 md:text-lg">
              Веселий тренажер з додавання, віднімання, множення і ділення. Формат
              коротких місій, зрозумілий інтерфейс та миттєвий фідбек на кожну відповідь.
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
                href="/addition"
              >
                Обрати тему
              </Link>
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

      <section className="mt-6">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList variant="line" className="mb-3">
            <TabsTrigger value="all">Всі теми</TabsTrigger>
            <TabsTrigger value="basic">Базові</TabsTrigger>
            <TabsTrigger value="advanced">Складніші</TabsTrigger>
          </TabsList>
          <TabsContent value={mode} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => (
          <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20" key={card.href}>
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
      </section>

      <section className="mt-6">
        <div className="rounded-xl bg-gray-100 p-6 text-gray-900">
          Tailwind test div: `p-6 bg-gray-100 text-gray-900` працює коректно.
        </div>
      </section>
    </SiteFrame>
  );
}
