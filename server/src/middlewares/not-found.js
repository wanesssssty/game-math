const { HttpError } = require("../utils/http-error");

function notFoundMiddleware(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFoundMiddleware };
