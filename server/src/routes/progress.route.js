const { Router } = require("express");
const {
  createProgressSession,
  getProgressByChildName,
} = require("../controllers/progress.controller");

const progressRouter = Router();

progressRouter.post("/", createProgressSession);
progressRouter.get("/:childName", getProgressByChildName);

module.exports = { progressRouter };
