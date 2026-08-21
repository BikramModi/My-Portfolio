import {
    describe,
    it,
    expect,

} from "@jest/globals";

import {
    startTraceEvent,
    completeTraceEvent,
} from "../../../src/observability/trace.service.js";

describe(
    "Agent Memory Tracing",
    () => {

        it(
            "should record a successful memory load",
            async () => {
                const trace = {
                    runId:
                        "test-run",

                    startedAt:
                        new Date(),

                    events: [],
                };

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "memory",
                            name: "memory.load",
                            metadata: {
                                conversationId:
                                    "conversation-1",

                                limit: 10,
                            },
                        }
                    );

                completeTraceEvent(
                    trace,
                    event.eventId,
                    {
                        status:
                            "completed",

                        metadata: {
                            messageCount: 4,
                        },
                    }
                );

                expect(
                    trace.events
                ).toHaveLength(1);

                expect(
                    trace.events[0].type
                ).toBe("memory");

                expect(
                    trace.events[0].name
                ).toBe(
                    "memory.load"
                );

                expect(
                    trace.events[0].status
                ).toBe(
                    "completed"
                );

                expect(
                    trace.events[0]
                        .metadata.messageCount
                ).toBe(4);

                expect(
                    trace.events[0].durationMs
                ).toBeGreaterThanOrEqual(0);
            }
        );

        it(
            "should record a failed memory load",
            () => {
                const trace = {
                    runId:
                        "test-run",

                    startedAt:
                        new Date(),

                    events: [],
                };

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "memory",
                            name: "memory.load",
                        }
                    );

                completeTraceEvent(
                    trace,
                    event.eventId,
                    {
                        status: "failed",

                        metadata: {
                            error:
                                "Redis unavailable",
                        },
                    }
                );

                expect(
                    trace.events[0].status
                ).toBe("failed");

                expect(
                    trace.events[0]
                        .metadata.error
                ).toBe(
                    "Redis unavailable"
                );
            }
        );

        it(
            "should record a successful memory save",
            () => {
                const trace = {
                    runId:
                        "test-run",

                    startedAt:
                        new Date(),

                    events: [],
                };

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "memory",
                            name: "memory.save",
                            metadata: {
                                conversationId:
                                    "conversation-1",
                            },
                        }
                    );

                completeTraceEvent(
                    trace,
                    event.eventId,
                    {
                        status:
                            "completed",
                    }
                );

                expect(
                    trace.events[0].type
                ).toBe("memory");

                expect(
                    trace.events[0].name
                ).toBe(
                    "memory.save"
                );

                expect(
                    trace.events[0].status
                ).toBe(
                    "completed"
                );
            }
        );

        it(
            "should not store conversation content in trace metadata",
            () => {
                const trace = {
                    runId:
                        "test-run",

                    startedAt:
                        new Date(),

                    events: [],
                };

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "memory",
                            name: "memory.load",
                            metadata: {
                                conversationId:
                                    "conversation-1",

                                messageCount: 5,
                            },
                        }
                    );

                completeTraceEvent(
                    trace,
                    event.eventId
                );

                const metadata =
                    trace.events[0]
                        .metadata;

                expect(
                    metadata.messages
                ).toBeUndefined();

                expect(
                    metadata.content
                ).toBeUndefined();
            }
        );

    }
);