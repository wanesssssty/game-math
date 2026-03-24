const { env } = require("./config");
const cors = require("cors");
const express = require("express");
const { apiRouter } = require("./routes");
const { notFoundMiddleware } = require("./middlewares/not-found");
const { errorHandler } = require("./middlewares/error-handler");

const app = express();

app.use(
  cors({
    // У dev дозволяємо будь-який localhost (3000, 3001, …), щоб Next не ламався при зайнятому порту.
    origin:
      env.nodeEnv === "development" ? true : env.corsOrigin,
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
