import crypto from "crypto";

export function createAgentState({
      requestId,
    message,
    user = null,
    conversationId = null,
}) {
    return {
        requestId,

        message,

        user,

        context: {},

         memory: {
            conversationId,
            messages: [],
        },

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