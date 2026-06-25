"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuestPromoBanner } from "@/components/guest-promo-banner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { ApiError } from "@/lib/api/client";
import {
  fetchHint,
  fetchProblem,
  getOperationLabel,
  submitProblemAnswer,
  toApiOperation,
  toClientOperation,
  type ClientOperation,
  type ProblemData,
} from "@/lib/game-api";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

type SessionMode =
  | {
      kind: "single";
      operation: ClientOperation;
    }
  | {
      kind: "mixed";
    };

type ApiTrainingSessionProps = {
  title: string;
  description: string;
  mode: SessionMode;
  showErrorLog?: boolean;
};

type FeedbackState = {
  ok: boolean;
  text: string;
};

const totalQuestions = 10;
const autoNextDelaySeconds = 5;
const pad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const mixedOperations: ClientOperation[] = ["add", "subtract", "multiply", "divide"];

function pickMixedOperation(previous: ClientOperation | null) {
  const allowed = mixedOperations.filter((operation) => operation !== previous);
  const pool = allowed.length > 0 ? allowed : mixedOperations;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ApiTrainingSession({
  title,
  description,
  mode,
  showErrorLog = false,
}: ApiTrainingSessionProps) {
  const { isAuthenticated, isHydrated, patchUser } = useAuth();
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState<ProblemData | null>(null);
  const [currentOperation, setCurrentOperation] = useState<ClientOperation | null>(null);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sessionCandy, setSessionCandy] = useState(0);
  const [hint, setHint] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pageError, setPageError] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [autoNextSecondsLeft, setAutoNextSecondsLeft] = useState<number | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const autoNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const levelControls = useMemo(() => {
    const canDecrease = level > 1;
    const canIncrease = level < 10;

    return { canDecrease, canIncrease };
  }, [level]);

  const loadQuestion = useCallback(
    async (targetLevel: number, previousOperation: ClientOperation | null) => {
      setIsLoadingQuestion(true);
      setPageError("");
      setHint("");
      setInput("");
      setAwaitingNext(false);
      setAutoNextSecondsLeft(null);
      setFeedback(null);

      try {
        const nextOperation =
          mode.kind === "mixed" ? pickMixedOperation(previousOperation) : mode.operation;
        const nextQuestion = await fetchProblem(toApiOperation(nextOperation), targetLevel);
        setQuestion(nextQuestion);
        setCurrentOperation(toClientOperation(nextQuestion.operationType));
      } catch (error) {
        setPageError(
          error instanceof ApiError
            ? error.message
            : "Ой, приклад не завантажився. Натисни «Почати знову» або онови сторінку."
        );
      } finally {
        setIsLoadingQuestion(false);
      }
    },
    [mode]
  );

  const startSession = useCallback(
    async (targetLevel: number) => {
      setLevel(targetLevel);
      setAttempts(0);
      setCorrect(0);
      setSessionCandy(0);
      setErrorLog([]);
      setSummaryOpen(false);
      setAutoNextSecondsLeft(null);
      await loadQuestion(targetLevel, null);
    },
    [loadQuestion]
  );

  useEffect(() => {
    if (!awaitingNext || summaryOpen) {
      return;
    }

    setAutoNextSecondsLeft(autoNextDelaySeconds);

    const intervalId = window.setInterval(() => {
      setAutoNextSecondsLeft((current) => {
        if (current === null) return autoNextDelaySeconds;
        return current > 1 ? current - 1 : 1;
      });
    }, 1000);

    autoNextTimeoutRef.current = setTimeout(() => {
      if (currentOperation) {
        void loadQuestion(level, currentOperation);
      }
    }, autoNextDelaySeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      if (autoNextTimeoutRef.current) {
        window.clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
      }
    };
  }, [awaitingNext, currentOperation, level, loadQuestion, summaryOpen]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void startSession(level);
  }, [isHydrated, startSession]); // level reset is controlled manually.

  const answeredAll = attempts >= totalQuestions;
  const canInteract =
    Boolean(question) &&
    !awaitingNext &&
    !summaryOpen &&
    !isLoadingQuestion &&
    !isSubmitting;

  const onDigitClick = (digit: string) => {
    if (!canInteract) return;
    setInput((prev) => `${prev}${digit}`);
  };

  const onSubmit = async () => {
    if (!question || !input || !canInteract) return;

    setIsSubmitting(true);
    setPageError("");

    try {
      const result = await submitProblemAnswer(question.problemToken, Number(input));
      const nextAttempts = attempts + 1;
      const nextCorrect = result.correct ? correct + 1 : correct;

      setAttempts(nextAttempts);
      setCorrect(nextCorrect);

      if (result.correct) {
        const earned = result.candyEarned ?? 0;
        setSessionCandy((prev) => prev + earned);
        if (isAuthenticated && typeof result.candyBalance === "number") {
          patchUser({ candyBalance: result.candyBalance });
        }
        setFeedback({
          ok: true,
          text: `Правильно! +${earned} цукерок до балансу.`,
        });
      } else {
        setErrorLog((prev) =>
          question && currentOperation
            ? [
                `${getOperationLabel(currentOperation)}: ${question.display.replace(
                  " = ?",
                  ""
                )} -> ${input}`,
                ...prev,
              ]
            : prev
        );
        setFeedback({
          ok: false,
          text: "Невірна відповідь. Приклад додано до журналу помилок.",
        });
      }

      setAwaitingNext(nextAttempts < totalQuestions);
      setHint("");

      if (nextAttempts >= totalQuestions) {
        setSummaryOpen(true);
      }
    } catch (error) {
      setPageError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося перевірити відповідь. Спробуй ще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLoadHint = async () => {
    if (!question || awaitingNext || isHintLoading) return;

    setIsHintLoading(true);
    setPageError("");

    try {
      const result = await fetchHint(question.problemToken);
      setHint(result.hint);
    } catch (error) {
      setPageError(
        error instanceof ApiError ? error.message : "Підказку поки не вдалося завантажити."
      );
    } finally {
      setIsHintLoading(false);
    }
  };

  const onNextQuestion = async () => {
    if (!currentOperation) return;
    if (autoNextTimeoutRef.current) {
      window.clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    await loadQuestion(level, currentOperation);
  };

  const restartAtLevel = async (targetLevel: number) => {
    await startSession(targetLevel);
  };

  return (
    <>
      {!isAuthenticated ? <GuestPromoBanner className="mb-4" /> : null}
      <Card className="rounded-2xl border-indigo-300/20 bg-slate-900/90 shadow-xl shadow-black/20">
        <CardHeader className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black md:text-4xl">{title}</CardTitle>
              <p className="max-w-3xl text-indigo-100/85">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">10 питань</Badge>
              <Badge variant="secondary">Рівень {level}</Badge>
              {currentOperation ? (
                <Badge variant="secondary">{getOperationLabel(currentOperation)}</Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-sm font-semibold text-slate-200">Складність</p>
            <button
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-slate-700 text-slate-100"
              )}
              disabled={!levelControls.canDecrease || isLoadingQuestion}
              onClick={() => void restartAtLevel(level - 1)}
              type="button"
            >
              Рівень -
            </button>
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">
              Поточний рівень: {level}
            </div>
            <button
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-slate-700 text-slate-100"
              )}
              disabled={!levelControls.canIncrease || isLoadingQuestion}
              onClick={() => void restartAtLevel(level + 1)}
              type="button"
            >
              Рівень +
            </button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Progress value={(attempts / totalQuestions) * 100}>
            <ProgressLabel>Твій прогрес</ProgressLabel>
            <ProgressValue>{() => `${attempts}/${totalQuestions}`}</ProgressValue>
          </Progress>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Правильні</p>
              <p className="mt-2 text-2xl font-black text-emerald-200">{correct}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Помилки</p>
              <p className="mt-2 text-2xl font-black text-rose-200">{attempts - correct}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Зароблено</p>
              <p className="mt-2 text-2xl font-black text-amber-200">{sessionCandy} цукерок</p>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-300/20 bg-slate-950/60 p-5">
            <p className="text-sm font-semibold text-slate-300">
              {isLoadingQuestion
                ? "Завантажуємо новий приклад..."
                : question?.display ?? "Підготовка завдання..."}
            </p>
            <p className="mt-4 text-3xl font-black md:text-5xl">
              {question?.display ?? "Почекай..."}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="grid gap-3">
              <Input
                className="w-full rounded-xl border border-indigo-300/30 bg-slate-950 px-4 py-3 text-xl outline-none ring-cyan-300/40 focus:ring"
                disabled={!canInteract}
                onChange={(event) => setInput(event.target.value.replace(/\D/g, ""))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && input && canInteract) {
                    event.preventDefault();
                    void onSubmit();
                  }
                }}
                placeholder="Введи відповідь"
                value={input}
              />
              <div className="grid grid-cols-3 gap-2">
                {pad.map((digit) => (
                  <button
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
                    )}
                    disabled={!canInteract}
                    key={digit}
                    onClick={() => onDigitClick(digit)}
                    type="button"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
                  )}
                  disabled={!canInteract || input.length === 0}
                  onClick={() => setInput((prev) => prev.slice(0, -1))}
                  type="button"
                >
                  ←
                </button>
                <button
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-lg border-indigo-300/30 bg-indigo-950/80 px-3 py-3 text-lg font-black text-slate-100 transition hover:border-cyan-300 hover:bg-indigo-900"
                  )}
                  disabled={!canInteract || input.length === 0}
                  onClick={() => setInput("")}
                  type="button"
                >
                  C
                </button>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <Button
                className="rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
                disabled={!input || !canInteract}
                onClick={() => void onSubmit()}
                type="button"
              >
                {isSubmitting ? "Перевіряємо..." : "Перевірити"}
              </Button>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-xl border-slate-700 text-slate-100"
                )}
                disabled={!question || awaitingNext || isHintLoading || isLoadingQuestion}
                onClick={() => void onLoadHint()}
                type="button"
              >
                {isHintLoading ? "Шукаємо підказку..." : "Підказка"}
              </button>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-xl border-slate-700 text-slate-100"
                )}
                disabled={!awaitingNext}
                onClick={() => void onNextQuestion()}
                type="button"
              >
                Наступне завдання
              </button>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-xl border-slate-700 text-slate-100"
                )}
                disabled={isLoadingQuestion || isSubmitting}
                onClick={() => void restartAtLevel(level)}
                type="button"
              >
                Почати знову
              </button>
            </div>
          </div>

          {hint ? (
            <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
              <p className="font-semibold">Підказка</p>
              <p className="mt-1">{hint}</p>
            </div>
          ) : null}

          {feedback ? (
            <div
              className={cn(
                "rounded-2xl border p-4 text-sm font-semibold",
                feedback.ok
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-100"
              )}
            >
              {feedback.text}
            </div>
          ) : null}

          {awaitingNext && autoNextSecondsLeft !== null ? (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
              <Progress value={((autoNextDelaySeconds - autoNextSecondsLeft) / autoNextDelaySeconds) * 100}>
                <ProgressLabel className="text-cyan-100">
                  Переходимо до наступного завдання
                </ProgressLabel>
                <ProgressValue className="text-cyan-100">
                  {() => `${autoNextSecondsLeft} с`}
                </ProgressValue>
              </Progress>
              <p className="mt-3 text-sm text-cyan-100/90">
                Через {autoNextSecondsLeft} секунд приклад зміниться автоматично.
              </p>
            </div>
          ) : null}

          {pageError ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-100">
              {pageError}
            </div>
          ) : null}

          {showErrorLog ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-semibold text-slate-100">Поточний журнал помилок</p>
              {errorLog.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">Поки що без помилок.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {errorLog.slice(0, 6).map((item) => (
                    <li
                      className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="justify-between text-sm text-slate-400">
          <p>Відповідай по черзі, дивись підказку за потреби й завершуй серію з 10 задач.</p>
          <p>
            {answeredAll
              ? "Молодець, місію завершено!"
              : awaitingNext
                ? "Наступне завдання відкриється автоматично"
                : "Після перевірки перейдемо до наступного завдання"}
          </p>
        </CardFooter>
      </Card>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Місію завершено!</DialogTitle>
            <DialogDescription className="text-slate-300">
              Ти завершив {totalQuestions} завдань на рівні {level}. Ось твій результат.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Правильні</p>
              <p className="mt-2 text-2xl font-black text-emerald-200">{correct}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Помилки</p>
              <p className="mt-2 text-2xl font-black text-rose-200">{attempts - correct}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Цукерки</p>
              <p className="mt-2 text-2xl font-black text-amber-200">{sessionCandy}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-300 px-4 font-extrabold text-slate-900"
              onClick={() => void restartAtLevel(level)}
              type="button"
            >
              Нова місія
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
