export function buildResponse(state) {
    return {
        answer: state.answer,

        requestId: state.requestId,

        plan: state.plan,

        toolResults: state.toolResults,

        prompt: state.prompt,

        serializedPrompt:
            state.serializedPrompt,

        metadata: {
            startedAt:
                state.metadata.startedAt,

            completedAt:
                Date.now(),
        },
    };
}