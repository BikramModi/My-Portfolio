import crypto from "crypto";

export function createAgentState({
    message,
    user = null,
}) {
    return {
        requestId: crypto.randomUUID(),

        message,

        user,

        context: {},

        plan: {
            intent: null,
            workflow: null,
            tools: []
        },

        toolResults: [],

        prompt: {
            system: "",
            context: "",
            user: "",
        },

        serializedPrompt: "",

        llmResponse: null,

        answer: null,

        metadata: {
            startedAt: Date.now(),
        },
    };
}