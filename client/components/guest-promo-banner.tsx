"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GuestPromoBannerProps = {
  className?: string;
  compact?: boolean;
};

export function GuestPromoBanner({ className, compact = false }: GuestPromoBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-300/25 bg-gradient-to-r from-amber-950/50 via-slate-950/80 to-cyan-950/50 p-4",
        className
      )}
    >
      <p className="text-sm font-bold text-amber-100">
        {compact ? "🍬 Заробляй цукерки за правильні відповіді!" : "🍬 Грай і збирай цукерки!"}
      </p>
      <p className="mt-1 text-sm text-slate-300">
        {compact
          ? "Увійди в акаунт, щоб зберегти їх і відкрити магазин з котиками."
          : "Проходь тести та тренування — за кожну правильну відповідь ти отримуєш цукерки. Увійди в акаунт, щоб зберегти нагороди, купити котика в магазині й бачити свій прогрес."}
      </p>
      <Link
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-3 rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 font-extrabold text-slate-900"
        )}
        href="/login"
      >
        Увійти або створити акаунт
      </Link>
    </div>
  );
}
