import { createAgentState } from "./state.js";
import { buildContext } from "./context.js";
import { createPlan } from "./planner.js";
import { executePlan } from "./executor.js";
import { buildPrompt } from "../prompt/prompt-builder.js";
import { serializePrompt } from "../prompt/prompt-serializer.js";
import { buildResponse } from "./response.js";
import { generateLLMResponse } from "../llm/llm-router.js";

import { startTraceEvent, completeTraceEvent, recordTraceError } from "../observability/trace.service.js";

import {
    memoryManager,
    saveConversationMemory,
    generateConversationId,
} from "../memory/memory.index.js";

import {
    MEMORY_LIMITS,
} from "../memory/memory-limit.config.js";

export async function runAgent({
    message,
    user,
    conversationId,
}) {
    const activeConversationId =
        conversationId ??
        generateConversationId();

    const state =
        createAgentState({
            message,
            user,
            conversationId:
                activeConversationId,
        });

    const agentEvent =
        startTraceEvent(
            state.trace,
            {
                type: "agent",
                name: "agent.run",
                metadata: {
                    conversationId:
                        state.conversationId,
                },
            }
        );

    try {

        const memoryLoadEvent =
            startTraceEvent(
                state.trace,
                {
                    type: "memory",
                    name: "memory.load",
                    metadata: {
                        conversationId:
                            state.conversationId,

                        limit:
                            MEMORY_LIMITS.maxMessages,
                    },
                }
            );

        try {
            state.memory.messages =
                await memoryManager
                    .getRecentMessages(
                        activeConversationId,
                        MEMORY_LIMITS.maxMessages
                    );

            completeTraceEvent(
                state.trace,
                memoryLoadEvent.eventId,
                {
                    status: "completed",
                    metadata: {
                        messageCount:
                            state.memory.messages.length,
                    },
                }
            );

        } catch (error) {
            completeTraceEvent(
                state.trace,
                memoryLoadEvent.eventId,
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

        await buildContext(state);

        state.plan =
            await createPlan(state);

        await executePlan(state);

        buildPrompt(state);

        serializePrompt(state);

        await generateLLMResponse(state);

        const memorySaveEvent =
            startTraceEvent(
                state.trace,
                {
                    type: "memory",
                    name: "memory.save",
                    metadata: {
                        conversationId:
                            state.conversationId,
                    },
                }
            );

        try {
            await saveConversationMemory(
                state
            );

            completeTraceEvent(
                state.trace,
                memorySaveEvent.eventId,
                {
                    status: "completed",
                }
            );

        } catch (error) {
            completeTraceEvent(
                state.trace,
                memorySaveEvent.eventId,
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

        completeTraceEvent(
            state.trace,
            agentEvent.eventId
        );

        return buildResponse(state);

    } catch (error) {

        recordTraceError(
            state.trace,
            {
                type: "agent",
                name: "agent.error",
                error,
                metadata: {
                    conversationId:
                        state.conversationId,
                },
            }
        );

        const currentAgentEvent =
            state.trace.events.find(
                ({ eventId }) =>
                    eventId ===
                    agentEvent.eventId
            );

        if (
            currentAgentEvent &&
            currentAgentEvent.status ===
            "started"
        ) {
            completeTraceEvent(
                state.trace,
                agentEvent.eventId,
                {
                    status: "failed",
                }
            );
        }

        throw error;
    }
}