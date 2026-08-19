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

import {
    logAgentStart,
    logAgentComplete,
    logAgentError,
} from "../observability/agent-logger.js";

import {
    logInfo,
    logError,
} from "../observability/logger.js";

import {
    recordAgentStarted,
    recordAgentCompleted,
    recordAgentFailed,
    recordAgentDuration,
    recordMemoryLoad,
    recordMemorySave,
    recordMemoryLoadDuration,
    recordMemorySaveDuration,
} from "../observability/agent-metrics.js";

export async function runAgent({
    message,
    user,
    conversationId,
    requestId,
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
            requestId,
        });

    recordAgentStarted();

    logAgentStart(state);

    const agentEvent =
        startTraceEvent(
            state.trace,
            {
                type: "agent",
                name: "agent.run",
                metadata: {
                    conversationId:
                        state.conversationId,

                    requestId:
                        state.requestId,
                },
            }
        );

    try {

        recordMemoryLoad();

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

            const completedEvent =
                completeTraceEvent(
                    state.trace,
                    memoryLoadEvent.eventId,
                    {
                        status:
                            "completed",

                        metadata: {
                            messageCount:
                                state.memory
                                    .messages
                                    .length,
                        },
                    }
                );

            recordMemoryLoadDuration(
                completedEvent.durationMs
            );

            logInfo(
                "Agent memory loaded",
                {
                    event:
                        "memory.loaded",

                    requestId:
                        state.requestId,

                    runId:
                        state.trace?.runId,

                    messageCount:
                        state.memory.messages.length,
                }
            );

        } catch (error) {

            const failedMemoryLoad = completeTraceEvent(
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

            recordMemoryLoadDuration(failedMemoryLoad.durationMs);

            logError(
                "Agent memory load failed",
                {
                    event:
                        "memory.failed",

                    requestId:
                        state.requestId,

                    runId:
                        state.trace?.runId,

                    error: {
                        name:
                            error.name,

                        message:
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

        recordMemorySave();

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

            const completedMemorySave = completeTraceEvent(
                state.trace,
                memorySaveEvent.eventId,
                {
                    status: "completed",
                }
            );

            recordMemorySaveDuration(completedMemorySave.durationMs);

            logInfo(
                "Agent memory saved",
                {
                    event:
                        "memory.saved",

                    requestId:
                        state.requestId,

                    runId:
                        state.trace?.runId,
                }
            );

        } catch (error) {

            const failedMemorySave = completeTraceEvent(
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

            recordMemorySaveDuration(failedMemorySave.durationMs);


            logError(
                "Agent memory save failed",
                {
                    event:
                        "memory.failed",

                    requestId:
                        state.requestId,

                    runId:
                        state.trace?.runId,

                    error: {
                        name:
                            error.name,

                        message:
                            error.message,
                    },
                }
            );



            throw error;
        }

        const completedAgentEvent =
            completeTraceEvent(
                state.trace,
                agentEvent.eventId,
            );

        recordAgentCompleted();

        recordAgentDuration(
            completedAgentEvent.durationMs
        );

        logAgentComplete(state);

        return buildResponse(state);

    } catch (error) {

        recordAgentFailed();

        logAgentError(state, error);

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
            const failedAgentEvent =
                completeTraceEvent(
                    state.trace,
                    agentEvent.eventId,
                    {
                        status: "failed",
                    }
                );

            if (
                failedAgentEvent
            ) {
                recordAgentDuration(
                    failedAgentEvent.durationMs
                );
            }
        }

        throw error;
    }
}