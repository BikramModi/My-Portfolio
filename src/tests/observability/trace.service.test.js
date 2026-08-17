import {
    describe,
    it,
    expect,
} from "@jest/globals";

import {
    createTrace,
    addTraceEvent,
    startTraceEvent,
    completeTraceEvent,
    recordTraceError,
} from "../../../src/observability/trace.service.js";

describe(
    "Trace Service",
    () => {

        it(
            "should create a trace",
            () => {
                const trace =
                    createTrace();

                expect(
                    trace.runId
                ).toBeDefined();

                expect(
                    trace.startedAt
                ).toBeInstanceOf(Date);

                expect(
                    trace.events
                ).toEqual([]);
            }
        );

        it(
            "should add a trace event",
            () => {
                const trace =
                    createTrace();

                const event =
                    addTraceEvent(
                        trace,
                        {
                            type: "agent",
                            name: "agent.run",
                        }
                    );

                expect(
                    event.eventId
                ).toBeDefined();

                expect(
                    event.type
                ).toBe("agent");

                expect(
                    event.name
                ).toBe("agent.run");

                expect(
                    event.status
                ).toBe("completed");

                expect(
                    trace.events
                ).toHaveLength(1);
            }
        );

        it(
            "should start and complete an event",
            async () => {
                const trace =
                    createTrace();

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "tool",
                            name: "rag",
                        }
                    );

                expect(
                    event.status
                ).toBe("started");

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            5
                        )
                );

                const completed =
                    completeTraceEvent(
                        trace,
                        event.eventId
                    );

                expect(
                    completed.status
                ).toBe("completed");

                expect(
                    completed.completedAt
                ).toBeInstanceOf(Date);

                expect(
                    completed.durationMs
                ).toBeGreaterThanOrEqual(0);
            }
        );

        it(
            "should record failed events",
            () => {
                const trace =
                    createTrace();

                const event =
                    startTraceEvent(
                        trace,
                        {
                            type: "llm",
                            name: "llm.generate",
                        }
                    );

                completeTraceEvent(
                    trace,
                    event.eventId,
                    {
                        status: "failed",
                        metadata: {
                            error:
                                "Provider failed",
                        },
                    }
                );

                expect(
                    event.status
                ).toBe("failed");

                expect(
                    event.metadata.error
                ).toBe(
                    "Provider failed"
                );
            }
        );

        it(
            "should reject an unknown event",
            () => {
                const trace =
                    createTrace();

                expect(() =>
                    completeTraceEvent(
                        trace,
                        "unknown-event"
                    )
                ).toThrow(
                    'Trace event "unknown-event" not found.'
                );
            }
        );

        it(
            "should record an agent error",
            () => {
                const trace =
                    createTrace();

                const error =
                    new Error(
                        "Something failed"
                    );

                const event =
                    recordTraceError(
                        trace,
                        {
                            type: "agent",
                            name: "agent.error",
                            error,
                            metadata: {
                                conversationId:
                                    "conversation-1",
                            },
                        }
                    );

                expect(
                    event.eventId
                ).toBeDefined();

                expect(
                    event.type
                ).toBe("agent");

                expect(
                    event.name
                ).toBe(
                    "agent.error"
                );

                expect(
                    event.status
                ).toBe("failed");

                expect(
                    event.metadata
                        .conversationId
                ).toBe(
                    "conversation-1"
                );

                expect(
                    event.metadata
                        .error.name
                ).toBe("Error");

                expect(
                    event.metadata
                        .error.message
                ).toBe(
                    "Something failed"
                );
            }
        );


        it(
            "should not store the error stack",
            () => {
                const trace =
                    createTrace();

                const error =
                    new Error(
                        "Sensitive failure"
                    );

                const event =
                    recordTraceError(
                        trace,
                        {
                            error,
                        }
                    );

                expect(
                    event.metadata.error.stack
                ).toBeUndefined();
            }
        );


        it(
            "should associate a trace with a request ID",
            () => {
                const trace =
                    createTrace(
                        "request-123"
                    );

                expect(
                    trace.requestId
                ).toBe(
                    "request-123"
                );

                expect(
                    trace.runId
                ).toBeDefined();
            }
        );




    }
);