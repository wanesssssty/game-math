"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Backpack,
  BookOpen,
  Calculator,
  Coins,
  Home,
  LogIn,
  LogOut,
  Menu,
  ShoppingBag,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarNavItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/use-auth";

const navItems = [
  { href: "/", label: "Головна", icon: Home, group: "Навігація" },
  { href: "/addition", label: "Додавання", icon: Calculator, group: "Тренування" },
  { href: "/subtraction", label: "Віднімання", icon: Calculator, group: "Тренування" },
  { href: "/multiplication", label: "Множення", icon: Calculator, group: "Тренування" },
  { href: "/division", label: "Ділення", icon: Calculator, group: "Тренування" },
  { href: "/test", label: "Змішаний тест", icon: BookOpen, group: "Тренування" },
  { href: "/shop", label: "Магазин", icon: ShoppingBag, group: "Профіль", requiresAuth: true },
  { href: "/avatar", label: "Мій котик", icon: Sparkles, group: "Профіль", requiresAuth: true },
  { href: "/inventory", label: "Інвентар", icon: Backpack, group: "Профіль", requiresAuth: true },
  { href: "/account", label: "Акаунт", icon: UserCircle2, group: "Профіль", requiresAuth: true },
];

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || isAuthenticated);
  const userName = user?.name || user?.email || null;
  const navGroups = useMemo(() => {
    return visibleNavItems.reduce<Record<string, typeof visibleNavItems>>((groups, item) => {
      const current = groups[item.group] ?? [];
      current.push(item);
      groups[item.group] = current;
      return groups;
    }, {});
  }, [visibleNavItems]);

  const handleNavigate = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      {mobileOpen ? (
        <button
          aria-label="Закрити сайдбар"
          className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar className="shadow-2xl shadow-black/30 lg:shadow-none">
          <SidebarHeader>
            <Link className="inline-flex items-center gap-3 text-lg font-black tracking-wide" href="/">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 via-cyan-300 to-pink-300 text-slate-900 shadow-[0_0_22px_#67e8f980]">
                🐾
              </span>
              <span>Math Paws</span>
            </Link>
            <p className="mt-3 text-sm text-sidebar-foreground/65">
              Математичні місії, баланс, інвентар і профіль в одному місці.
            </p>
          </SidebarHeader>

          <SidebarContent>
            {Object.entries(navGroups).map(([groupName, items]) => (
              <SidebarGroup key={groupName} title={groupName}>
                {items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link href={item.href} key={item.href} onClick={handleNavigate}>
                      <SidebarNavItem active={pathname === item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarNavItem>
                    </Link>
                  );
                })}
              </SidebarGroup>
            ))}

            {!isAuthenticated ? (
              <SidebarGroup title="Доступ">
                <Link href="/login" onClick={handleNavigate}>
                  <SidebarNavItem active={pathname === "/login"}>
                    <LogIn className="size-4" />
                    <span>Авторизація</span>
                  </SidebarNavItem>
                </Link>
              </SidebarGroup>
            ) : null}
          </SidebarContent>

          <SidebarFooter>
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-100">
                    <Coins className="size-4" />
                    <span>Баланс: {user?.candyBalance ?? 0} цукерок</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">
                  {userName}
                </div>
                <Button
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    clearAuth();
                    setMobileOpen(false);
                  }}
                  type="button"
                  variant="outline"
                >
                  <LogOut className="size-4" />
                  <span>Вийти</span>
                </Button>
              </div>
            ) : (
              <p className="px-2 text-sm text-sidebar-foreground/60">
                Увійди в акаунт, щоб відкрити баланс, магазин, інвентар і персональний профіль.
              </p>
            )}
          </SidebarFooter>
        </Sidebar>
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-sky-200/20 bg-slate-950/85 backdrop-blur">
          <div className="mx-auto flex w-[min(1120px,92%)] items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Відкрити навігацію"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Menu className="size-4" />
              </Button>
              <div>
                <p className="text-lg font-black tracking-wide">Math Paws</p>
                <p className="text-sm text-indigo-100/70">Навчайся через гру</p>
              </div>
            </div>
            {isAuthenticated ? (
              <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-100">
                {user?.candyBalance ?? 0} цукерок
              </div>
            ) : (
              <Link
                className="rounded-full border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-200 hover:bg-cyan-300/10"
                href="/login"
              >
                Увійти
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 py-8">
          <div className="mx-auto w-[min(1120px,92%)]">{children}</div>
        </main>

        <footer className="border-t border-sky-200/20 bg-slate-950">
          <div className="mx-auto flex w-[min(1120px,92%)] flex-wrap items-center justify-between gap-4 py-4 text-sm text-indigo-100/80">
            <p>Math Paws • інтерактивна математика з прогресом, балансом і котячими нагородами.</p>
            <p>© 2026 • Навчайся через гру</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
