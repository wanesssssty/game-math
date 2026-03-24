"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Головна" },
  { href: "/addition", label: "Додавання" },
  { href: "/subtraction", label: "Віднімання" },
  { href: "/multiplication", label: "Множення" },
  { href: "/division", label: "Ділення" },
  { href: "/test", label: "Тест" },
  { href: "/shop", label: "Магазин" },
  { href: "/inventory", label: "Інвентар" },
  { href: "/login", label: "Авторизація" },
];

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-sky-200/20 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex w-[min(1120px,92%)] flex-wrap items-center justify-between gap-4 py-4">
          <Link className="inline-flex items-center gap-2 text-lg font-black tracking-wide" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-300 via-cyan-300 to-pink-300 text-slate-900 shadow-[0_0_22px_#67e8f980]">
              🐾
            </span>
            <span>Math Paws</span>
          </Link>
          <nav>
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
                      pathname === item.href
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                        : "border-slate-700 text-slate-200 hover:border-cyan-200 hover:bg-cyan-300/10"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="mx-auto w-[min(1120px,92%)]">{children}</div>
      </main>

      <footer className="border-t border-sky-200/20 bg-slate-950">
        <div className="mx-auto flex w-[min(1120px,92%)] flex-wrap items-center justify-between gap-4 py-4">
          <div className="inline-flex items-center gap-2 text-lg font-black tracking-wide">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-300 via-cyan-300 to-pink-300 text-slate-900 shadow-[0_0_22px_#67e8f980]">
              🐱
            </span>
            <span>Math Paws</span>
          </div>
          <p className="text-sm text-indigo-100/80">
            support@mathpaws.local • © 2026 Інтерактивна математика • Зроблено з любовʼю до навчання
          </p>
        </div>
      </footer>
    </div>
  );
}
