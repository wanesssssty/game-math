const { Router } = require("express");
const { healthRouter } = require("./health.route");

const apiRouter = Router();

apiRouter.use("/health", healthRouter);

module.exports = { apiRouter };
