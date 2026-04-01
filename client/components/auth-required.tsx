"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthRequiredProps = {
  title: string;
  description: string;
};

export function AuthRequired({ title, description }: AuthRequiredProps) {
  return (
    <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-3xl font-black">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-slate-300">{description}</p>
        <Link
          className={cn(
            buttonVariants(),
            "w-fit rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
          )}
          href="/login"
        >
          Увійти в акаунт
        </Link>
      </CardContent>
    </Card>
  );
}
