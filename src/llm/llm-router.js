import { generateAIResponse } from "../ai/models/index.model.js";

import {
    startTraceEvent,
    completeTraceEvent,
} from "../observability/trace.service.js";

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

        return state;

    } catch (error) {

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