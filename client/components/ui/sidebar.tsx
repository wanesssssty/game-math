"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sidebar({ className, ...props }: ComponentPropsWithoutRef<"aside">) {
  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
      data-slot="sidebar"
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("border-b border-sidebar-border px-4 py-4", className)}
      data-slot="sidebar-header"
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex-1 space-y-6 overflow-y-auto px-3 py-4", className)}
      data-slot="sidebar-content"
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("border-t border-sidebar-border px-3 py-4", className)}
      data-slot="sidebar-footer"
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  title,
  children,
}: {
  className?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-2", className)} data-slot="sidebar-group">
      <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-sidebar-foreground/55">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function SidebarNavItem({
  active = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      data-slot="sidebar-nav-item"
      {...props}
    />
  );
}
