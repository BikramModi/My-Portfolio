import { createAgentState }
from "./state.js";

import { buildContext }
from "./context.js";

import { createPlan }
from "./planner.js";

import { executePlan }
from "./executor.js";

import { buildResponse }
from "./response.js";

export async function runAgent({

    message,

    user

}){

    const state=
        createAgentState({

            message,

            user

        });

    await buildContext(state);

    state.plan=
        await createPlan(state);

    await executePlan(state);

    state.answer=
        state.toolResult[0]?.result?.answer ??
        "No response.";

    return buildResponse(state);

}