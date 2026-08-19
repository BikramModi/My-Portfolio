import {
    incrementMetric,
    recordMetricDuration,
} from "./metrics.service.js";

export function recordAgentStarted() {
    incrementMetric(
        "agent.runs.total"
    );
}

export function recordAgentCompleted() {
    incrementMetric(
        "agent.runs.completed"
    );
}

export function recordAgentFailed() {
    incrementMetric(
        "agent.runs.failed"
    );
}

export function recordAgentDuration(
    durationMs
) {
    recordMetricDuration(
        "agent.duration",
        durationMs
    );
}

export function recordToolExecuted() {
    incrementMetric(
        "agent.tools.executed"
    );
}

export function recordToolFailed() {
    incrementMetric(
        "agent.tools.failed"
    );
}

export function recordLLMRequest() {
    incrementMetric(
        "agent.llm.requests"
    );
}

export function recordLLMFailed() {
    incrementMetric(
        "agent.llm.failed"
    );
}

export function recordLLMDuration(
    durationMs
) {
    recordMetricDuration(
        "agent.llm.duration",
        durationMs
    );
}

export function recordMemoryLoad() {
    incrementMetric(
        "agent.memory.loads"
    );
}

export function recordMemorySave() {
    incrementMetric(
        "agent.memory.saves"
    );
}

export function recordMemoryLoadDuration(
    durationMs
) {
    recordMetricDuration(
        "agent.memory.load.duration",
        durationMs
    );
}

export function recordMemorySaveDuration(
    durationMs
) {
    recordMetricDuration(
        "agent.memory.save.duration",
        durationMs
    );
}