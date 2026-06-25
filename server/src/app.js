const { env } = require("./config");
const cors = require("cors");
const express = require("express");
const { apiRouter } = require("./routes");
const { notFoundMiddleware } = require("./middlewares/not-found");
const { errorHandler } = require("./middlewares/error-handler");

function normalizeOrigin(value) {
  return value.trim().replace(/\/+$/, "");
}

function createCorsOrigin() {
  if (env.nodeEnv === "development") {
    return true;
  }

  const allowed = env.corsOrigin
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowed.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    // Vercel production + preview URLs
    if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
}

const app = express();

app.use(
  cors({
    origin: createCorsOrigin(),
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Сервер Math Paws запущено",
    hint: "Перевірка: GET /api/health",
  });
});

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorHandler);

module.exports = { app };
