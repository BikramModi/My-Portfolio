import {
    mongoMemoryProvider,
} from "../memory/mongo-memory.service.js";

export async function buildContext(state) {

    const conversationId =
        state.memory.conversationId;

    let messages = [];

    if (conversationId) {
        messages =
            await mongoMemoryProvider
                .getRecentMessages(
                    conversationId
                );
    }

    state.memory.messages =
        messages;

    state.context = {
        timestamp:
            new Date().toISOString(),

        conversationId,

        memory: messages,
    };

    return state;
}