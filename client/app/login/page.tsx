"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SiteFrame } from "@/components/site-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMsg("Заповни email і пароль.");
      return;
    }
    setMsg("Успіх! Це демо-авторизація без бекенда.");
  };

  return (
    <SiteFrame>
      <Card className="max-w-xl rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-3xl font-black md:text-4xl">Авторизація</CardTitle>
          <p className="text-indigo-100/85">Демо-форма входу в стилі оновленого дизайну.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <Input
            className="rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 outline-none ring-cyan-300/40 focus:ring"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 outline-none ring-cyan-300/40 focus:ring"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className={cn(
              buttonVariants(),
              "rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/30"
            )}
            type="submit"
          >
            Увійти
          </button>
        </form>
        {msg ? <p className="font-semibold text-indigo-100/85">{msg}</p> : null}
        </CardContent>
      </Card>
    </SiteFrame>
  );
}
