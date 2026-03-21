"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Operation = "+" | "-" | "×" | "÷";

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newQuestion() {
  const ops: Operation[] = ["+", "-", "×", "÷"];
  const op = ops[random(0, ops.length - 1)];

  if (op === "+") {
    const a = random(1, 20);
    const b = random(1, 20);
    return { a, b, op, answer: a + b };
  }
  if (op === "-") {
    const a = random(10, 30);
    const b = random(1, a);
    return { a, b, op, answer: a - b };
  }
  if (op === "×") {
    const a = random(1, 12);
    const b = random(1, 12);
    return { a, b, op, answer: a * b };
  }

  const b = random(1, 12);
  const answer = random(1, 12);
  const a = b * answer;
  return { a, b, op, answer };
}

export function MixedTest() {
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState(() => newQuestion());

  const check = () => {
    const ok = Number(answer) === q.answer;
    setAttempts((x) => x + 1);
    if (ok) {
      setScore((x) => x + 1);
      setStatus("Правильно! +1 бал");
    } else {
      setStatus(`Не зовсім. Правильна відповідь: ${q.answer}`);
    }
    setAnswer("");
    setQ(newQuestion());
  };

  return (
    <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-3xl font-black md:text-4xl">Загальний тест</CardTitle>
        <p className="text-indigo-100/85">Змішані завдання на +, -, ×, ÷</p>
      </CardHeader>
      <CardContent className="grid gap-4">
      <p className="my-1 text-3xl font-black md:text-4xl">
        {q.a} {q.op} {q.b} = ?
      </p>
      <Input
        className="w-full max-w-xs rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 text-xl outline-none ring-cyan-300/40 focus:ring"
        value={answer}
        onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
      />
      <div>
        <button
          className={cn(
            buttonVariants(),
            "rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/30"
          )}
          onClick={check}
          type="button"
        >
          Перевірити
        </button>
      </div>
      <p className="font-semibold text-indigo-100/85">{status}</p>
      <p className="font-bold text-cyan-200">
        Рахунок: {score}/{attempts}
      </p>
      </CardContent>
    </Card>
  );
}
