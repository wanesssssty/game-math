"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthRequiredProps = {
  title: string;
  description: string;
  perks?: string[];
  playHref?: string;
  playLabel?: string;
};

const defaultPerks = [
  "Зберігай цукерки та прогрес назавжди",
  "Відкрий магазин і купи нового котика",
  "Дивись свої нагороди в інвентарі",
];

export function AuthRequired({
  title,
  description,
  perks = defaultPerks,
  playHref = "/test",
  playLabel = "Спочатку пограти без входу",
}: AuthRequiredProps) {
  return (
    <div className="grid gap-4">
      <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-3xl font-black">{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-slate-300">{description}</p>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-sm font-semibold text-cyan-100">Що відкриється після входу</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {perks.map((perk) => (
                <li className="flex gap-2" key={perk}>
                  <span aria-hidden>✨</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className={cn(
                buttonVariants(),
                "rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
              )}
              href="/login"
            >
              Увійти в акаунт
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-slate-700 text-slate-100"
              )}
              href={playHref}
            >
              {playLabel}
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
        <p className="font-semibold">Підказка</p>
        <p className="mt-1 text-amber-100/90">
          Спочатку пройди тест або тренування — зароби цукерки. Потім попроси дорослого допомогти
          створити акаунт, щоб нічого не загубилось.
        </p>
      </div>
    </div>
  );
}
