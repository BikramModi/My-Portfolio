import express from "express";
import HANDLERS from "./handlers/index.handler.js";
import errorMiddleware from "./middlerwares/error.middleware.js";
import { authMiddleware } from "./middlerwares/auth.middleware.js";
import cors from "cors";

import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import { requestIdMiddleware } from "./middlerwares/request-id.middleware.js";

const SERVER = express();

SERVER.set("trust proxy", 1);

if (process.env.NODE_ENV !== "test") {
  SERVER.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

SERVER.use(
  cors({
    origin: [process.env.FRONTEND_LOCAL, process.env.FRONTEND_PROD],
    credentials: true,
  })
);

SERVER.use(express.json());

SERVER.use(cookieParser());

SERVER.use(requestIdMiddleware);

SERVER.use(authMiddleware);
SERVER.use("/", HANDLERS);
SERVER.use(errorMiddleware);

export default SERVER;
