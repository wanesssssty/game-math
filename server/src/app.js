const cors = require("cors");
const express = require("express");
const { apiRouter } = require("./routes");
const { env } = require("./config");
const { notFoundMiddleware } = require("./middlewares/not-found");
const { errorHandler } = require("./middlewares/error-handler");

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Game Math API is running",
  });
});

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorHandler);

module.exports = { app };
