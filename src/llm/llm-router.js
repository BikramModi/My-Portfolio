import { generateAIResponse }
    from "../ai/models/index.model.js";

export async function generateLLMResponse(state) {

    const response =
        await generateAIResponse(
            state.serializedPrompt
        );

    state.llmResponse = response;

    state.answer = response;

    return state;

}