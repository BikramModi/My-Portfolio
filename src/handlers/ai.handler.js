import * as aiService from "../services/ai.service.js";



import Router from "express";



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


export default AI_ROUTER;

