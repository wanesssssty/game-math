"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Op = "add" | "subtract" | "multiply" | "divide";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTask(operation: Op) {
  if (operation === "add") {
    const a = rand(1, 20);
    const b = rand(1, 20);
    return { a, b, sign: "+", answer: a + b };
  }

  if (operation === "subtract") {
    const a = rand(10, 30);
    const b = rand(1, a);
    return { a, b, sign: "-", answer: a - b };
  }

  if (operation === "multiply") {
    const a = rand(1, 12);
    const b = rand(1, 12);
    return { a, b, sign: "×", answer: a * b };
  }

  const b = rand(1, 12);
  const answer = rand(1, 12);
  const a = b * answer;
  return { a, b, sign: "÷", answer };
}

const pad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function OperationGame({
  title,
  description,
  operation,
}: {
  title: string;
  description: string;
  operation: Op;
}) {
  const [task, setTask] = useState(() => makeTask(operation));
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<null | { ok: boolean; text: string }>(null);

  const submit = () => {
    if (Number(input) === task.answer) {
      setMessage({ ok: true, text: "Правильно! Молодець 🎉" });
    } else {
      setMessage({ ok: false, text: "Неправильно, спробуй ще раз." });
    }
  };

  const nextTask = () => {
    setInput("");
    setMessage(null);
    setTask(makeTask(operation));
  };

  return (
    <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-3xl font-black md:text-4xl">{title}</CardTitle>
        <p className="text-indigo-100/85">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-4">

      <p className="my-1 text-3xl font-black md:text-4xl">
        {task.a} {task.sign} {task.b} = ?
      </p>

      <Input
        className="w-full max-w-xs rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 text-xl outline-none ring-cyan-300/40 focus:ring"
        value={input}
        readOnly
        placeholder="Введи відповідь"
      />
      <div className="grid w-full max-w-xs grid-cols-3 gap-2">
        {pad.map((n) => (
          <button
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
            )}
            key={n}
            onClick={() => setInput((prev) => `${prev}${n}`)}
            type="button"
          >
            {n}
          </button>
        ))}
        <button
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
          )}
          onClick={() => setInput("")}
          type="button"
        >
          C
        </button>
        <button
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
          )}
          onClick={submit}
          type="button"
        >
          =
        </button>
      </div>
      <div>
        {message && (
          <p className={message.ok ? "font-extrabold text-emerald-400" : "font-extrabold text-red-400"}>
            {message.text}
          </p>
        )}
      </div>
      </CardContent>
      <CardFooter>
        <button
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-xl border-indigo-200/40 px-4 font-bold text-slate-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
          )}
          onClick={nextTask}
          type="button"
        >
          Наступне завдання
        </button>
      </CardFooter>
    </Card>
  );
}
