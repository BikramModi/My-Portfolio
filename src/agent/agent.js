import { createAgentState } from "./state.js";
import { buildContext } from "./context.js";
import { createPlan } from "./planner.js";
import { executePlan } from "./executor.js";
import { buildPrompt } from "../prompt/prompt-builder.js";
import { serializePrompt } from "../prompt/prompt-serializer.js";
import { buildResponse } from "./response.js";

export async function runAgent({
    message,
    user,
}) {
    const state = createAgentState({
        message,
        user,
    });

    await buildContext(state);

    state.plan = await createPlan(state);

    await executePlan(state);

    buildPrompt(state);

    serializePrompt(state);

    // Temporary placeholder until Module 6
    state.answer =
        "Prompt successfully built. Waiting for LLM generation.";

    return buildResponse(state);
}