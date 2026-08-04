import { systemPrompt } from "../prompts/system.prompt.js";

export function buildPrompt(state) {
    const ragResult = state.toolResults.find(
        ({ tool }) => tool === "rag"
    );

    const retrievedContext =
        ragResult?.data?.retrievedContext ?? "";

    state.prompt = {
        system: systemPrompt,

        context: retrievedContext,

        tools: state.toolResults,

        user: state.message,
    };

    return state;
}