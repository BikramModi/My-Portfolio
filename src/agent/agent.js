import { createAgentState } from "./state.js";
import { buildContext } from "./context.js";
import { createPlan } from "./planner.js";
import { executePlan } from "./executor.js";
import { buildPrompt } from "../prompt/prompt-builder.js";
import { serializePrompt } from "../prompt/prompt-serializer.js";
import { buildResponse } from "./response.js";
import { generateLLMResponse } from "../llm/llm-router.js";

import {
    memoryManager,
    saveConversationMemory,
    generateConversationId,
} from "../memory/memory.index.js";

export async function runAgent({
    message,
    user,
    conversationId,
}) {
    const activeConversationId =
        conversationId ??
        generateConversationId();

    const state = createAgentState({
        message,
        user,
        conversationId:
            activeConversationId,
    });

    state.memory.messages =
        await memoryManager.getRecentMessages(
            activeConversationId,
            10
        );

    await buildContext(state);

    state.plan =
        await createPlan(state);

    await executePlan(state);

    buildPrompt(state);

    serializePrompt(state);

    await generateLLMResponse(state);

    await saveConversationMemory(state);

    return buildResponse(state);
}