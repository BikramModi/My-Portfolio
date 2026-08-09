import {
    memoryManager,
    createConversationMessage,
} from "./memory.index.js";

export async function saveConversationMemory(
    state
) {
    const conversationId =
        state.memory.conversationId;

    if (!conversationId) {
        throw new Error(
            "Conversation ID is required to save memory."
        );
    }

    if (!state.message) {
        throw new Error(
            "User message is required to save memory."
        );
    }

    if (!state.answer) {
        throw new Error(
            "Assistant answer is required to save memory."
        );
    }

    const userMessage =
        createConversationMessage({
            role: "user",
            content: state.message,
        });

    const assistantMessage =
        createConversationMessage({
            role: "assistant",
            content: state.answer,
        });

    await memoryManager.addMessage(
        conversationId,
        userMessage,
        {
            userId:
                state.user?._id,
        }
    );

    await memoryManager.addMessage(
        conversationId,
        assistantMessage,
        {
            userId:
                state.user?._id,
        }
    );
}