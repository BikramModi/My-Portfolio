import {
    describe,
    it,
    expect,
    jest,
    beforeEach,
} from "@jest/globals";

import {
    executePlan,
} from "../../../src/agent/executor.js";

import {
    getTool,
} from "../../../src/tools/tool-manager.js";

jest.mock(
    "../../../src/tools/tool-manager.js",
    () => ({
        getTool: jest.fn(),
    })
);

describe(
    "Agent Executor",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it(
            "should execute tools and record trace events",
            async () => {
                const state = {
                    conversationId:
                        "test-conversation",

                    plan: {
                        tools: [
                            "rag",
                        ],
                    },

                    toolResults: [],

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                getTool.mockReturnValue({
                    execute:
                        jest.fn()
                            .mockResolvedValue({
                                answer:
                                    "RAG result",
                            }),
                });

                await executePlan(state);

                expect(
                    state.toolResults
                ).toHaveLength(1);

                expect(
                    state.toolResults[0].tool
                ).toBe("rag");

                expect(
                    state.toolResults[0].data.answer
                ).toBe("RAG result");

                expect(
                    state.trace.events
                ).toHaveLength(1);

                expect(
                    state.trace.events[0].type
                ).toBe("tool");

                expect(
                    state.trace.events[0].name
                ).toBe("rag");

                expect(
                    state.trace.events[0].status
                ).toBe("completed");

                expect(
                    state.trace.events[0].durationMs
                ).toBeGreaterThanOrEqual(0);
            }
        );

        it(
            "should record a failed tool execution",
            async () => {
                const state = {
                    conversationId:
                        "test-conversation",

                    plan: {
                        tools: [
                            "rag",
                        ],
                    },

                    toolResults: [],

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                getTool.mockReturnValue({
                    execute:
                        jest.fn()
                            .mockRejectedValue(
                                new Error(
                                    "RAG failed"
                                )
                            ),
                });

                await expect(
                    executePlan(state)
                ).rejects.toThrow(
                    "RAG failed"
                );

                expect(
                    state.trace.events
                ).toHaveLength(1);

                expect(
                    state.trace.events[0].type
                ).toBe("tool");

                expect(
                    state.trace.events[0].name
                ).toBe("rag");

                expect(
                    state.trace.events[0].status
                ).toBe("failed");

                expect(
                    state.trace.events[0].metadata.error
                ).toBe("RAG failed");
            }
        );

        it(
            "should execute multiple tools",
            async () => {
                const state = {
                    conversationId:
                        "test-conversation",

                    plan: {
                        tools: [
                            "rag",
                            "calculator",
                        ],
                    },

                    toolResults: [],

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                getTool.mockImplementation(
                    (toolName) => ({
                        execute:
                            jest.fn()
                                .mockResolvedValue({
                                    toolName,
                                }),
                    })
                );

                await executePlan(state);

                expect(
                    state.toolResults
                ).toHaveLength(2);

                expect(
                    state.trace.events
                ).toHaveLength(2);

                expect(
                    state.trace.events.map(
                        ({ name }) => name
                    )
                ).toEqual([
                    "rag",
                    "calculator",
                ]);
            }
        );

    }
);