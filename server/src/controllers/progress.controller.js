const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");
const { toOperationType } = require("../utils/operation-map");
const { guestEmailFromDisplayName } = require("../utils/guest-user");

function validateProgressPayload(body) {
  const {
    childName,
    operation,
    totalQuestions,
    answered,
    correct,
    completedAt,
  } = body;

  if (!childName || typeof childName !== "string") {
    throw new HttpError(400, "childName is required");
  }
  if (!["add", "subtract", "multiply", "divide"].includes(operation)) {
    throw new HttpError(400, "operation must be one of add/subtract/multiply/divide");
  }
  if (!Number.isInteger(totalQuestions) || totalQuestions <= 0) {
    throw new HttpError(400, "totalQuestions must be a positive integer");
  }
  if (!Number.isInteger(answered) || answered < 0 || answered > totalQuestions) {
    throw new HttpError(400, "answered must be between 0 and totalQuestions");
  }
  if (!Number.isInteger(correct) || correct < 0 || correct > answered) {
    throw new HttpError(400, "correct must be between 0 and answered");
  }

  const parsedDate = new Date(completedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new HttpError(400, "completedAt must be a valid ISO date");
  }

  return {
    childName,
    operation,
    totalQuestions,
    answered,
    correct,
    completedAt: parsedDate,
  };
}

async function createProgressSession(req, res) {
  const payload = validateProgressPayload(req.body);
  const operationType = toOperationType(payload.operation);
  const email = guestEmailFromDisplayName(payload.childName);
  const wrongAnswers = payload.answered - payload.correct;
  const level = 1;
  const score = payload.correct;

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: payload.childName,
      password: null,
    },
    update: {
      name: payload.childName,
    },
  });

  const session = await prisma.gameSession.create({
    data: {
      userId: user.id,
      operationType,
      level,
      score,
      correctAnswers: payload.correct,
      wrongAnswers,
      createdAt: payload.completedAt,
    },
  });

  const progressKey = {
    userId_operationType_level: {
      userId: user.id,
      operationType,
      level,
    },
  };

  const existing = await prisma.progress.findUnique({ where: progressKey });
  const newHighScore = existing
    ? Math.max(existing.highScore, payload.correct)
    : payload.correct;

  await prisma.progress.upsert({
    where: progressKey,
    create: {
      userId: user.id,
      operationType,
      level,
      highScore: newHighScore,
      bestStreak: 0,
    },
    update: {
      highScore: newHighScore,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      id: session.id,
      childName: user.name || payload.childName,
      userId: user.id,
      operation: payload.operation,
      operationType,
      totalQuestions: payload.totalQuestions,
      answered: payload.answered,
      correct: payload.correct,
      completedAt: session.createdAt,
      gameSessionId: session.id,
    },
  });
}

async function getProgressByChildName(req, res) {
  const { childName } = req.params;

  if (!childName) {
    throw new HttpError(400, "childName param is required");
  }

  const email = guestEmailFromDisplayName(childName);
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      gameSessions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      progress: true,
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      childName: user?.name || childName,
      sessions: user?.gameSessions ?? [],
      progress: user?.progress ?? [],
    },
  });
}

module.exports = { createProgressSession, getProgressByChildName };
