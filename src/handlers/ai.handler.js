import * as aiService from "../services/ai.service.js";



import Router from "express";


import { generateResponse } from "../services/rag/ai.service.js";
import { chatValidator } from "../validators/ai.validator.js";
import validationMiddleware from "../middlerwares/validation.middleware.js";


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


AI_ROUTER.post("/chat/rag",
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


export default AI_ROUTER;

