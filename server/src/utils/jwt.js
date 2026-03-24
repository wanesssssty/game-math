const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAuthToken(userId, email) {
  return jwt.sign(
    { kind: "auth", sub: userId, email },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

/**
 * Короткоживучий токен задачі (щоб перевіряти відповідь без сесії на сервері).
 */
function signProblemToken(payload) {
  return jwt.sign(
    {
      kind: "problem",
      sub: payload.sub,
      op: payload.op,
      n1: payload.n1,
      n2: payload.n2,
      ans: payload.ans,
      lvl: payload.lvl,
    },
    env.jwtSecret,
    { expiresIn: "15m" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signAuthToken, signProblemToken, verifyToken };
