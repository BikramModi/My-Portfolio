import { createAgentState } from "./state.js";
import { buildContext } from "./context.js";
import { buildResponse } from "./response.js";

export async function runAgent({
    message,
    user,
}) {

    // Create state
    const state = createAgentState({
        message,
        user,
    });

    // Build execution context
    await buildContext(state);

    // Temporary answer
    state.answer =
        "Agent runtime initialized successfully.";

    // Build standardized response
    return buildResponse(state);
}