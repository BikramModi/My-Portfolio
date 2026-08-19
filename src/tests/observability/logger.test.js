import {
    describe,
    it,
    expect,
    jest,
    beforeEach,
} from "@jest/globals";

import {
    logInfo,
    logWarn,
    logError,
} from "../../../src/observability/logger.js";

describe(
    "Structured Logger",
    () => {

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it(
            "should create an info log",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const result =
                    logInfo(
                        "Agent started",
                        {
                            event:
                                "agent.started",

                            requestId:
                                "req-123",
                        }
                    );

                expect(
                    result.level
                ).toBe("info");

                expect(
                    result.message
                ).toBe(
                    "Agent started"
                );

                expect(
                    result.event
                ).toBe(
                    "agent.started"
                );

                expect(
                    result.requestId
                ).toBe(
                    "req-123"
                );

                expect(
                    result.timestamp
                ).toBeDefined();

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should create a warning log",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "warn"
                    ).mockImplementation(
                        () => {}
                    );

                const result =
                    logWarn(
                        "Something unusual happened"
                    );

                expect(
                    result.level
                ).toBe("warn");

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should create an error log",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "error"
                    ).mockImplementation(
                        () => {}
                    );

                const result =
                    logError(
                        "Agent failed",
                        {
                            event:
                                "agent.failed",
                        }
                    );

                expect(
                    result.level
                ).toBe("error");

                expect(
                    result.event
                ).toBe(
                    "agent.failed"
                );

                expect(
                    spy
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should produce valid JSON output",
            () => {
                const spy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                logInfo(
                    "Test message",
                    {
                        requestId:
                            "req-123",
                    }
                );

                const output =
                    spy.mock.calls[0][0];

                expect(
                    () =>
                        JSON.parse(output)
                ).not.toThrow();
            }
        );

    }
);