import { systemPrompt } from "../prompts/system.prompt.js";

function formatConversationMemory(messages = []) {
    if (!messages.length) {
        return "No previous conversation.";
    }

    return messages
        .map(({ role, content }) => {
            const normalizedRole =
                role.toUpperCase();

            return `${normalizedRole}: ${content}`;
        })
        .join("\n\n");
}

export function buildPrompt(state) {
    const ragResult = state.toolResults.find(
        ({ tool }) => tool === "rag"
    );

    const retrievedContext =
        ragResult?.data?.retrievedContext ?? "";

    const memory =
        formatConversationMemory(
            state.memory?.messages
        );

    state.prompt = {
        system: systemPrompt,

        memory,

        context: retrievedContext,

        tools: state.toolResults,

        user: state.message,
    };

    return state;
}