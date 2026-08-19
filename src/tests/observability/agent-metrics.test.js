import {
    describe,
    it,
    expect,
    beforeEach,
} from "@jest/globals";

import {
    recordAgentStarted,
    recordAgentCompleted,
    recordAgentFailed,
    recordToolExecuted,
    recordToolFailed,
    recordLLMRequest,
    recordLLMFailed,
    recordMemoryLoad,
    recordMemorySave,
} from "../../../src/observability/agent-metrics.js";

import {
    getMetricSnapshot,
    resetMetrics,
} from "../../../src/observability/metrics.service.js";

describe(
    "Agent Metrics",
    () => {

        beforeEach(() => {
            resetMetrics();
        });

        it(
            "should record Agent lifecycle metrics",
            () => {
                recordAgentStarted();

                recordAgentCompleted();

                recordAgentFailed();

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.runs.total"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.runs.completed"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.runs.failed"
                    ]
                ).toBe(1);
            }
        );

        it(
            "should record tool metrics",
            () => {
                recordToolExecuted();

                recordToolFailed();

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.tools.executed"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.tools.failed"
                    ]
                ).toBe(1);
            }
        );

        it(
            "should record LLM metrics",
            () => {
                recordLLMRequest();

                recordLLMFailed();

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.llm.requests"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.llm.failed"
                    ]
                ).toBe(1);
            }
        );

        it(
            "should record memory metrics",
            () => {
                recordMemoryLoad();

                recordMemorySave();

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.memory.loads"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.memory.saves"
                    ]
                ).toBe(1);
            }
        );

    }
);