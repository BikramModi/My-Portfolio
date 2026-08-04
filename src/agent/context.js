export async function buildContext(state) {

    state.context = {
        timestamp: new Date().toISOString(),

        conversationId: null,
    };

    return state;
}