import {
    describe,
    it,
    expect,
    beforeEach,
} from "@jest/globals";

import {
    incrementMetric,
    recordMetricDuration,
    getMetricSnapshot,
    resetMetrics,
} from "../../../src/observability/metrics.service.js";

describe(
    "Metrics Service",
    () => {

        beforeEach(() => {
            resetMetrics();
        });

        it(
            "should increment a counter",
            () => {
                incrementMetric(
                    "agent.runs.total"
                );

                incrementMetric(
                    "agent.runs.total"
                );

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.runs.total"
                    ]
                ).toBe(2);
            }
        );

        it(
            "should support custom counter increments",
            () => {
                incrementMetric(
                    "agent.tools.executed",
                    5
                );

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.tools.executed"
                    ]
                ).toBe(5);
            }
        );

        it(
            "should record duration metrics",
            () => {
                recordMetricDuration(
                    "agent.duration",
                    100
                );

                recordMetricDuration(
                    "agent.duration",
                    300
                );

                const metrics =
                    getMetricSnapshot();

                const duration =
                    metrics.durations[
                        "agent.duration"
                    ];

                expect(
                    duration.count
                ).toBe(2);

                expect(
                    duration.totalMs
                ).toBe(400);

                expect(
                    duration.averageMs
                ).toBe(200);

                expect(
                    duration.minMs
                ).toBe(100);

                expect(
                    duration.maxMs
                ).toBe(300);
            }
        );

        it(
            "should reject invalid duration",
            () => {
                expect(
                    () =>
                        recordMetricDuration(
                            "agent.duration",
                            -1
                        )
                ).toThrow(
                    "durationMs cannot be negative."
                );
            }
        );

        it(
            "should reset metrics",
            () => {
                incrementMetric(
                    "agent.runs.total"
                );

                resetMetrics();

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.runs.total"
                    ]
                ).toBeUndefined();
            }
        );

    }
);