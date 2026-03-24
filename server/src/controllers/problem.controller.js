const env = require("../config/env");
const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");
const { signProblemToken, verifyToken } = require("../utils/jwt");
const {
  generateProblem,
  formatProblemDisplay,
  hintForPayload,
} = require("../utils/math-problem");

const OPS = ["ADD", "SUB", "MUL", "DIV"];

async function getProblem(req, res) {
  const raw = (req.query.operationType || "ADD").toString().toUpperCase();
  const operationType = OPS.includes(raw) ? raw : null;
  if (!operationType) {
    throw new HttpError(400, "operationType має бути ADD, SUB, MUL або DIV");
  }

  const level = Math.min(Math.max(Number(req.query.level) || 1, 1), 10);
  const p = generateProblem(operationType, level);

  const problemToken = signProblemToken({
    sub: req.user.id,
    op: p.operationType,
    n1: p.n1,
    n2: p.n2,
    ans: p.answer,
    lvl: level,
  });

  return res.status(200).json({
    success: true,
    data: {
      problemToken,
      number1: p.n1,
      number2: p.n2,
      operationType: p.operationType,
      level,
      display: formatProblemDisplay(p),
    },
  });
}

async function postAnswer(req, res) {
  const { problemToken, answer } = req.body;

  if (!problemToken || answer === undefined || answer === null) {
    throw new HttpError(400, "Потрібні problemToken та answer");
  }

  let decoded;
  try {
    decoded = verifyToken(problemToken);
  } catch {
    throw new HttpError(400, "Невірний або прострочений problemToken");
  }

  if (decoded.kind !== "problem") {
    throw new HttpError(400, "Токен не є задачею");
  }
  if (decoded.sub !== req.user.id) {
    throw new HttpError(403, "Задача належить іншому користувачу");
  }

  const userAnswer = Number(answer);
  if (!Number.isFinite(userAnswer)) {
    throw new HttpError(400, "answer має бути числом");
  }

  const correct = userAnswer === decoded.ans;
  const op = decoded.op;
  const lvl = decoded.lvl;

  if (!correct) {
    await prisma.errorLog.create({
      data: {
        userId: req.user.id,
        operationType: op,
        number1: decoded.n1,
        number2: decoded.n2,
        correctAnswer: decoded.ans,
        userAnswer,
        attempts: 1,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        correct: false,
        message: "Невірна відповідь",
      },
    });
  }

  const reward = env.candyPerCorrectAnswer;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: req.user.id },
      data: { candyBalance: { increment: reward } },
    });

    const whereKey = {
      userId_operationType_level: {
        userId: req.user.id,
        operationType: op,
        level: lvl,
      },
    };

    await tx.progress.upsert({
      where: whereKey,
      create: {
        userId: req.user.id,
        operationType: op,
        level: lvl,
        highScore: 1,
        bestStreak: 1,
      },
      update: {
        highScore: { increment: 1 },
        bestStreak: { increment: 1 },
      },
    });
  });

  const fresh = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { candyBalance: true },
  });

  return res.status(200).json({
    success: true,
    data: {
      correct: true,
      candyEarned: reward,
      candyBalance: fresh.candyBalance,
      message: "Правильно!",
    },
  });
}

async function getHint(req, res) {
  const problemToken =
    req.query.problemToken || req.body?.problemToken || req.headers["x-problem-token"];

  if (!problemToken || typeof problemToken !== "string") {
    throw new HttpError(400, "Передай problemToken (query або body)");
  }

  let decoded;
  try {
    decoded = verifyToken(problemToken);
  } catch {
    throw new HttpError(400, "Невірний або прострочений problemToken");
  }

  if (decoded.kind !== "problem" || decoded.sub !== req.user.id) {
    throw new HttpError(403, "Немає доступу до цієї задачі");
  }

  const hint = hintForPayload(decoded);

  return res.status(200).json({
    success: true,
    data: { hint },
  });
}

module.exports = { getProblem, postAnswer, getHint };
