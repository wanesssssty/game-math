const { Router } = require("express");
const { healthRouter } = require("./health.route");
const { progressRouter } = require("./progress.route");
const { requireAuth, resolveUser } = require("../middlewares/auth");
const { register, login } = require("../controllers/auth.controller");
const { getProblem, postAnswer, getHint } = require("../controllers/problem.controller");
const { getShop, buy } = require("../controllers/shop.controller");
const { getInventory } = require("../controllers/inventory.controller");
const { updateAvatar } = require("../controllers/avatar.controller");
const { listErrors } = require("../controllers/errors-list.controller");
const { getAccount } = require("../controllers/account.controller");

const apiRouter = Router();

apiRouter.use("/health", healthRouter);

apiRouter.post("/register", register);
apiRouter.post("/login", login);

apiRouter.get("/shop", getShop);

apiRouter.use("/progress", progressRouter);

apiRouter.get("/problem", resolveUser, getProblem);
apiRouter.post("/problem/answer", resolveUser, postAnswer);
apiRouter.get("/hint", resolveUser, getHint);

apiRouter.use(requireAuth);

apiRouter.get("/account", getAccount);
apiRouter.post("/shop/buy", buy);
apiRouter.get("/inventory", getInventory);
apiRouter.post("/avatar/update", updateAvatar);
apiRouter.get("/errors", listErrors);

module.exports = { apiRouter };
