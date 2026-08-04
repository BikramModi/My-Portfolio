export function buildResponse(state) {

    return {

        answer: state.answer,

        requestId: state.requestId,

        metadata: {
            startedAt: state.metadata.startedAt,
            completedAt: Date.now(),
        }

    };

}