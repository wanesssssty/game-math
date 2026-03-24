const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  /** Локально 4001: на Windows порт 4000 часто займає Docker Desktop (порожня відповідь). У Docker задай PORT=4000 у compose. */
  port: Number(process.env.PORT || 4001),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwtSecret:
    process.env.JWT_SECRET || "dev-only-change-JWT_SECRET-in-production",
  candyPerCorrectAnswer: Number(process.env.CANDY_PER_CORRECT || 5),
};

module.exports = env;
