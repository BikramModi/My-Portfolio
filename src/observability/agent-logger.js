import {
    logInfo,
    logWarn,
    logError,
} from "./logger.js";

export function logAgentStart(
    state
) {
    return logInfo(
        "Agent execution started",
        {
            event:
                "agent.started",

            requestId:
                state.requestId,

            runId:
                state.trace?.runId,

            conversationId:
                state.conversationId,
        }
    );
}

export function logAgentComplete(
    state
) {
    return logInfo(
        "Agent execution completed",
        {
            event:
                "agent.completed",

            requestId:
                state.requestId,

            runId:
                state.trace?.runId,

            conversationId:
                state.conversationId,
        }
    );
}

export function logAgentError(
    state,
    error
) {
    return logError(
        "Agent execution failed",
        {
            event:
                "agent.failed",

            requestId:
                state.requestId,

            runId:
                state.trace?.runId,

            conversationId:
                state.conversationId,

            error: {
                name:
                    error.name,

                message:
                    error.message,
            },
        }
    );
}

export function logAgentWarning(
    state,
    message,
    metadata = {}
) {
    return logWarn(
        message,
        {
            event:
                "agent.warning",

            requestId:
                state.requestId,

            runId:
                state.trace?.runId,

            conversationId:
                state.conversationId,

            ...metadata,
        }
    );
}