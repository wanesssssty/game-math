"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const totalRounds = 10;
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState(() => newQuestion());
  const [finished, setFinished] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const check = () => {
    if (finished) return;

    const ok = Number(answer) === q.answer;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (ok) {
      setScore((x) => x + 1);
      setStatus("Правильно! +1 бал");
    } else {
      setStatus(`Не зовсім. Правильна відповідь: ${q.answer}`);
      setErrorLog((prev) => [
        `${q.a} ${q.op} ${q.b} = ${answer || "?"} (правильно: ${q.answer})`,
        ...prev,
      ]);
    }
    setAnswer("");
    if (nextAttempts >= totalRounds) {
      setFinished(true);
      return;
    }
    setQ(newQuestion());
  };

  const reset = () => {
    setScore(0);
    setAttempts(0);
    setAnswer("");
    setStatus("");
    setQ(newQuestion());
    setFinished(false);
    setErrorLog([]);
  };

  return (
    <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-3xl font-black md:text-4xl">Загальний тест</CardTitle>
        <p className="text-indigo-100/85">Змішані завдання на +, -, ×, ÷</p>
      </CardHeader>
      <CardContent className="grid gap-4">
      <Progress value={(attempts / totalRounds) * 100}>
        <ProgressLabel>Прогрес тесту</ProgressLabel>
        <ProgressValue>{() => `${attempts}/${totalRounds}`}</ProgressValue>
      </Progress>
      <div className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-300/30 text-xl">
          🧒
        </div>
        <div>
          <p className="font-semibold">Гравець: Math Hero</p>
          <p className="text-xs text-slate-300">Поточна сесія тренування</p>
        </div>
      </div>
      <p className="my-1 text-3xl font-black md:text-4xl">
        {q.a} {q.op} {q.b} = ?
      </p>
      <Input
        className="w-full max-w-xs rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 text-xl outline-none ring-cyan-300/40 focus:ring"
        disabled={finished}
        value={answer}
        onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
      />
      <div>
        <button
          className={cn(
            buttonVariants(),
            "rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/30"
          )}
          disabled={finished}
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
      <div className="rounded-xl bg-slate-900/70 p-3">
        <p className="mb-2 font-semibold">Журнал помилок</p>
        {errorLog.length === 0 ? (
          <p className="text-sm text-slate-400">Поки без помилок — чудово!</p>
        ) : (
          <ul className="space-y-2">
            {errorLog.slice(0, 6).map((item) => (
              <li
                className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1 text-sm text-red-200"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog open={finished} onOpenChange={(open) => !open && setFinished(false)}>
        <DialogContent className="bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Тест завершено</DialogTitle>
            <DialogDescription className="text-slate-300">
              Твій підсумок: {score} з {totalRounds}. Крута робота!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className={cn(
                buttonVariants(),
                "rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
              )}
              onClick={reset}
              type="button"
            >
              Спробувати ще
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </CardContent>
    </Card>
  );
}
