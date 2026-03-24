"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { saveChildProgress } from "@/lib/progress-storage";

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
const totalQuestions = 10;

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
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const submit = async () => {
    if (sessionDone) return;
    const isCorrect = Number(input) === task.answer;
    const nextAttempts = attempts + 1;
    const nextCorrect = isCorrect ? correct + 1 : correct;

    setAttempts(nextAttempts);
    if (isCorrect) {
      setCorrect(nextCorrect);
      setMessage({ ok: true, text: "Правильно! Молодець 🎉" });
    } else {
      setMessage({ ok: false, text: "Неправильно, спробуй ще раз." });
    }

    if (nextAttempts >= totalQuestions) {
      setSessionDone(true);
      setSavingState("saving");
      await saveChildProgress({
        childName: "Math Hero",
        operation,
        totalQuestions,
        answered: nextAttempts,
        correct: nextCorrect,
        completedAt: new Date().toISOString(),
      });
      setSavingState("saved");
    }
  };

  const nextTask = () => {
    if (sessionDone) return;
    setInput("");
    setMessage(null);
    setTask(makeTask(operation));
  };

  const restartSession = () => {
    setTask(makeTask(operation));
    setInput("");
    setMessage(null);
    setAttempts(0);
    setCorrect(0);
    setSessionDone(false);
    setSavingState("idle");
  };

  return (
    <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-3xl font-black md:text-4xl">{title}</CardTitle>
        <p className="text-indigo-100/85">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
      <Progress value={(attempts / totalQuestions) * 100}>
        <ProgressLabel>Прогрес дитини</ProgressLabel>
        <ProgressValue>{() => `${attempts}/${totalQuestions}`}</ProgressValue>
      </Progress>

      <p className="my-1 text-3xl font-black md:text-4xl">
        {task.a} {task.sign} {task.b} = ?
      </p>

      <Input
        className="w-full max-w-xs rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 text-xl outline-none ring-cyan-300/40 focus:ring"
        value={input}
        readOnly
        disabled={sessionDone}
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
            disabled={sessionDone}
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
          disabled={sessionDone}
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
          disabled={sessionDone}
          onClick={submit}
          type="button"
        >
          =
        </button>
      </div>
      <div>
        <p className="text-sm text-indigo-100/85">
          Спроб: {attempts} • Правильних: {correct}
          {sessionDone ? ` • Сесію завершено (${savingState})` : ""}
        </p>
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
        {sessionDone ? (
          <button
            className={cn(
              buttonVariants(),
              "ml-2 rounded-xl bg-linear-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
            )}
            onClick={restartSession}
            type="button"
          >
            Нова сесія
          </button>
        ) : null}
      </CardFooter>
      <Dialog open={Boolean(message)} onOpenChange={(open) => !open && setMessage(null)}>
        <DialogContent className="bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{message?.ok ? "Супер результат!" : "Спробуй ще раз"}</DialogTitle>
            <DialogDescription className="text-slate-300">{message?.text}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-indigo-200/40 px-4 font-bold text-slate-100"
              )}
              onClick={() => {
                setMessage(null);
                if (message?.ok) nextTask();
              }}
              type="button"
            >
              {message?.ok ? "До наступного" : "Закрити"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
