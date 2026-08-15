import { getTool } from "../tools/tool-manager.js";

import {
    startTraceEvent,
    completeTraceEvent,
} from "../observability/trace.service.js";

export async function executePlan(state) {
    const results = [];

    for (const toolName of state.plan.tools) {
        const tool = getTool(toolName);

        if (!tool) {
            throw new Error(
                `Tool "${toolName}" not found.`
            );
        }

        const toolEvent =
            startTraceEvent(
                state.trace,
                {
                    type: "tool",
                    name: toolName,
                    metadata: {
                        conversationId:
                            state.conversationId,
                    },
                }
            );

        try {
            const result =
                await tool.execute(state);

            results.push({
                tool: toolName,
                result,
            });

            completeTraceEvent(
                state.trace,
                toolEvent.eventId,
                {
                    status: "completed",
                }
            );

        } catch (error) {
            completeTraceEvent(
                state.trace,
                toolEvent.eventId,
                {
                    status: "failed",
                    metadata: {
                        error:
                            error.message,
                    },
                }
            );

            throw error;
        }
    }

    state.toolResults.push(
        ...results.map(
            ({ tool, result }) => ({
                tool,
                data: result,
            })
        )
    );

    return state;
}