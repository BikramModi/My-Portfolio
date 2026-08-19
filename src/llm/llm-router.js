import { generateAIResponse } from "../ai/models/index.model.js";

import {
    startTraceEvent,
    completeTraceEvent,
} from "../observability/trace.service.js";

import {
    logInfo,
    logError,
} from "../observability/logger.js";

export async function generateLLMResponse(state) {
    const provider =
        process.env.AI_PROVIDER;

    const llmEvent =
        startTraceEvent(
            state.trace,
            {
                type: "llm",
                name: "llm.generate",
                metadata: {
                    provider,
                },
            }
        );

    try {
        const response =
            await generateAIResponse(
                state.serializedPrompt
            );

        state.llmResponse =
            response;

        state.answer =
            response;

        completeTraceEvent(
            state.trace,
            llmEvent.eventId,
            {
                status: "completed",
            }
        );

        logInfo(
            "LLM generation completed",
            {
                event:
                    "llm.completed",

                provider,

                requestId:
                    state.requestId,

                runId:
                    state.trace?.runId,
            }
        );

        return state;

    } catch (error) {

        logError(
            "LLM generation failed",
            {
                event:
                    "llm.failed",

                provider,

                requestId:
                    state.requestId,

                runId:
                    state.trace?.runId,

                error: {
                    name:
                        error.name,

                    message:
                        error.message,
                },
            }
        );

        completeTraceEvent(
            state.trace,
            llmEvent.eventId,
            {
                status: "failed",
                metadata: {
                    error:
                        error.message,
                },
            }
        );

        throw error;
    }
}