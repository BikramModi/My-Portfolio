import { createAgentState } from "./state.js";
import { buildContext } from "./context.js";
import { createPlan } from "./planner.js";
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

    state.plan =
        await createPlan(state);

    state.answer =
        "Planning completed successfully.";

    return buildResponse(state);

}