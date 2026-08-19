import {
    describe,
    it,
    expect,
    jest,
    beforeEach,
} from "@jest/globals";

import {
    logAgentStart,
    logAgentComplete,
    logAgentError,
} from "../../../src/observability/agent-logger.js";

describe(
    "Agent Logger",
    () => {

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        const state = {
            requestId:
                "request-123",

            conversationId:
                "conversation-123",

            trace: {
                runId:
                    "run-123",
            },
        };

        it(
            "should log agent start",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const result =
                    logAgentStart(
                        state
                    );

                expect(
                    result.event
                ).toBe(
                    "agent.started"
                );

                expect(
                    result.requestId
                ).toBe(
                    "request-123"
                );

                expect(
                    result.runId
                ).toBe(
                    "run-123"
                );

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should log agent completion",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const result =
                    logAgentComplete(
                        state
                    );

                expect(
                    result.event
                ).toBe(
                    "agent.completed"
                );

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should log agent errors",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "error"
                    ).mockImplementation(
                        () => {}
                    );

                const error =
                    new Error(
                        "Agent failed"
                    );

                const result =
                    logAgentError(
                        state,
                        error
                    );

                expect(
                    result.event
                ).toBe(
                    "agent.failed"
                );

                expect(
                    result.error.message
                ).toBe(
                    "Agent failed"
                );

                expect(
                    result.requestId
                ).toBe(
                    "request-123"
                );

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should not log the user message",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const testState = {
                    ...state,

                    message:
                        "Private user message",
                };

                logAgentStart(
                    testState
                );

                const output =
                    spy.mock.calls[0][0];

                expect(
                    output
                ).not.toContain(
                    "Private user message"
                );
            }
        );

    }
);