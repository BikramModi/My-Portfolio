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

        plan: null,

        toolResult: null,

        answer: null,

        metadata: {
            startedAt: Date.now(),
        },
    };
}