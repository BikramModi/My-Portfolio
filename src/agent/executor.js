import { getTool }
from "../tools/tool-manager.js";

export async function executePlan(state){

    const results=[];

    for(const toolName of state.plan.tools){

        const tool=getTool(toolName);

        if(!tool){

            throw new Error(
                `Tool "${toolName}" not found.`
            );

        }

        const result=
            await tool.execute(state);

        results.push({

            tool:toolName,

            result

        });

    }

    state.toolResult=results;

    return state;

}