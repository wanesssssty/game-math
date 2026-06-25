"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SiteFrame } from "@/components/site-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { AuthPayload } from "@/lib/auth";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, saveAuth, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMsg("Заповни email і пароль.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setMsg("Для реєстрації пароль має містити щонайменше 6 символів.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const payload = await apiRequest<AuthPayload>(mode === "login" ? "/api/login" : "/api/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          ...(mode === "register" ? { name } : {}),
        }),
      });

      saveAuth(payload);
      setMsg(mode === "login" ? "Вхід успішний." : "Реєстрація успішна.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setMsg(
        error instanceof ApiError
          ? error.message
          : "Щось пішло не так. Перевір email і пароль та спробуй ще раз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteFrame>
      {isAuthenticated ? (
        <Card className="max-w-xl rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Ти вже увійшов</Badge>
              <Badge variant="secondary">Баланс: {user?.candyBalance ?? 0}</Badge>
            </div>
            <CardTitle className="text-3xl font-black md:text-4xl">Ти вже увійшов</CardTitle>
            <p className="text-indigo-100/85">
              Продовжуй навчання, відкрий акаунт або переходь у математичні режими.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <button
              className={cn(
                buttonVariants(),
                "rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
              )}
              onClick={() => router.push("/account")}
              type="button"
            >
              Відкрити акаунт
            </button>
            <button
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-slate-700 text-slate-100"
              )}
              onClick={() => router.push("/test")}
              type="button"
            >
              Перейти до тесту
            </button>
          </CardContent>
        </Card>
      ) : (
      <Card className="max-w-xl rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-3xl font-black md:text-4xl">Вхід у Math Paws</CardTitle>
          <p className="text-indigo-100/85">
            Увійди або створи акаунт, щоб зберігати цукерки, купувати котиків і бачити свій
            прогрес.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
        <div className="flex gap-2">
          <button
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl",
              mode === "login" ? "border-cyan-300 bg-cyan-300/10" : "border-slate-700"
            )}
            onClick={() => {
              setMode("login");
              setMsg("");
            }}
            type="button"
          >
            Вхід
          </button>
          <button
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl",
              mode === "register" ? "border-cyan-300 bg-cyan-300/10" : "border-slate-700"
            )}
            onClick={() => {
              setMode("register");
              setMsg("");
            }}
            type="button"
          >
            Реєстрація
          </button>
        </div>
        <form className="grid gap-3" onSubmit={onSubmit}>
          {mode === "register" ? (
            <Input
              className="rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 outline-none ring-cyan-300/40 focus:ring"
              type="text"
              placeholder="Ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : null}
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
            disabled={loading}
            type="submit"
          >
            {loading ? "Зачекай..." : mode === "login" ? "Увійти" : "Створити акаунт"}
          </button>
        </form>
        {msg ? <p className="font-semibold text-indigo-100/85">{msg}</p> : null}
        </CardContent>
      </Card>
      )}
    </SiteFrame>
  );
}
