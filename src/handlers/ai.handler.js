import * as aiService from "../services/ai.service.js";



import Router from "express";


import { generateResponse } from "../services/rag/ai.service.js";
import { generateRAGResponse } from "../services/rag/rag.service.js";

import { chatValidator } from "../validators/ai.validator.js";
import validationMiddleware from "../middlerwares/validation.middleware.js";


import { runAgent } from "../agent/agent.js";


const AI_ROUTER = Router();



AI_ROUTER.get("/health",
    async (req, res, next) => {
        try {
            const result = await aiService.healthCheck();

            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

AI_ROUTER.get("/models",
    async (req, res, next) => {
        try {
            const result = await aiService.getModels();

            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

AI_ROUTER.post("/chat",
    async (req, res, next) => {
        try {
            const { model, prompt } = req.body;

            if (!model || !prompt) {
                return res.status(400).json({
                    success: false,
                    message: "model and prompt are required",
                });
            }

            const response = await aiService.chat(model, prompt);

            res.json({
                success: true,
                response,
            });
        } catch (err) {
            next(err);
        }
    }
);


AI_ROUTER.post("/chat/gen-ai",
    validationMiddleware(chatValidator),
    async (req, res, next) => {
        try {
            const { message } = req.body;

            const response =
                await generateResponse(message);

            return res.status(200).json({
                message: 'AI response generated successfully.',
                data: {
                    response
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

AI_ROUTER.post(
    "/chat/rag-ai",
    validationMiddleware(chatValidator),
    async (req, res, next) => {
        try {
            const { message } = req.body;

            const result =
                await generateRAGResponse(message);

            return res.status(200).json({
                message:
                    "RAG response generated successfully.",

                data: result.answer,
            });
        } catch (error) {
            next(error);
        }
    }
);

AI_ROUTER.post(
    "/chat/agentic-ai",
    validationMiddleware(chatValidator),

    async (req, res, next) => {
        try {

            const {
                message,
                conversationId,
            } = req.body;

            const result =
                await runAgent({
                    message,
                    user: req.user ?? null,
                    conversationId,
                });

            return res.status(200).json({
                success: true,
                message:
                    "Agent response generated successfully.",
                data: result,
            });

        } catch (error) {
            next(error);
        }
    }
);

export default AI_ROUTER;

