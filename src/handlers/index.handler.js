import Router from "express";

import USER_ROUTER from "./user.handler.js";
import AUTH_ROUTER from "./auth.handler.js";

const HANDLERS = Router();

HANDLERS.use("/users", USER_ROUTER);
HANDLERS.use("/auth", AUTH_ROUTER);

export default HANDLERS;
