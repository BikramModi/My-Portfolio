export function buildResponse(state) {

    return {

        answer: state.answer,

        requestId: state.requestId,

        plan: state.plan,

        metadata: {
            startedAt: state.metadata.startedAt,
            completedAt: Date.now(),
        }

    };

}