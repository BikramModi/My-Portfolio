import Router from "express";

import USER_ROUTER from "./user.handler.js";
import AUTH_ROUTER from "./auth.handler.js";
import AI_ROUTER from "./ai.handler.js";

const HANDLERS = Router();

HANDLERS.use("/users", USER_ROUTER);
HANDLERS.use("/auth", AUTH_ROUTER);
HANDLERS.use("/ai", AI_ROUTER);

export default HANDLERS;
