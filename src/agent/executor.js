import { getTool } from "../tools/tool-manager.js";

export async function executePlan(state) {
    state.toolResults = [];

    for (const toolName of state.plan.tools) {
        const tool = getTool(toolName);

        if (!tool) {
            throw new Error(
                `Tool "${toolName}" not found.`
            );
        }

        const result = await tool.execute(state);

        state.toolResults.push({
            tool: tool.name,
            data: result,
        });
    }

    return state;
}