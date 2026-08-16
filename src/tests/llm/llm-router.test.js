import {
    describe,
    it,
    expect,
    jest,
    beforeEach,
} from "@jest/globals";

import {
    generateLLMResponse,
} from "../../../src/llm/llm-router.js";

import {
    generateAIResponse,
} from "../../../src/ai/models/index.model.js";

jest.mock(
    "../../../src/ai/models/index.model.js",
    () => ({
        generateAIResponse:
            jest.fn(),
    })
);

describe(
    "LLM Router",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();

            process.env.AI_PROVIDER =
                "gemini";
        });

        it(
            "should generate an LLM response and record a completed trace event",
            async () => {

                generateAIResponse
                    .mockResolvedValue(
                        "This is the AI response."
                    );

                const state = {
                    serializedPrompt:
                        "Tell me about my portfolio.",

                    llmResponse:
                        null,

                    answer:
                        null,

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                const result =
                    await generateLLMResponse(
                        state
                    );

                expect(
                    generateAIResponse
                ).toHaveBeenCalledTimes(1);

                expect(
                    generateAIResponse
                ).toHaveBeenCalledWith(
                    "Tell me about my portfolio."
                );

                expect(
                    result.llmResponse
                ).toBe(
                    "This is the AI response."
                );

                expect(
                    result.answer
                ).toBe(
                    "This is the AI response."
                );

                expect(
                    result.trace.events
                ).toHaveLength(1);

                const event =
                    result.trace.events[0];

                expect(
                    event.type
                ).toBe("llm");

                expect(
                    event.name
                ).toBe(
                    "llm.generate"
                );

                expect(
                    event.status
                ).toBe(
                    "completed"
                );

                expect(
                    event.metadata.provider
                ).toBe(
                    "gemini"
                );

                expect(
                    event.startedAt
                ).toBeInstanceOf(
                    Date
                );

                expect(
                    event.completedAt
                ).toBeInstanceOf(
                    Date
                );

                expect(
                    event.durationMs
                ).toBeGreaterThanOrEqual(0);
            }
        );

        it(
            "should record a failed trace event when the LLM fails",
            async () => {

                generateAIResponse
                    .mockRejectedValue(
                        new Error(
                            "Gemini API failed"
                        )
                    );

                const state = {
                    serializedPrompt:
                        "Tell me about my portfolio.",

                    llmResponse:
                        null,

                    answer:
                        null,

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                await expect(
                    generateLLMResponse(
                        state
                    )
                ).rejects.toThrow(
                    "Gemini API failed"
                );

                expect(
                    generateAIResponse
                ).toHaveBeenCalledTimes(1);

                expect(
                    state.llmResponse
                ).toBeNull();

                expect(
                    state.answer
                ).toBeNull();

                expect(
                    state.trace.events
                ).toHaveLength(1);

                const event =
                    state.trace.events[0];

                expect(
                    event.type
                ).toBe("llm");

                expect(
                    event.name
                ).toBe(
                    "llm.generate"
                );

                expect(
                    event.status
                ).toBe(
                    "failed"
                );

                expect(
                    event.metadata.provider
                ).toBe(
                    "gemini"
                );

                expect(
                    event.metadata.error
                ).toBe(
                    "Gemini API failed"
                );

                expect(
                    event.completedAt
                ).toBeInstanceOf(
                    Date
                );

                expect(
                    event.durationMs
                ).toBeGreaterThanOrEqual(0);
            }
        );

        it(
            "should not expose the prompt in trace metadata",
            async () => {

                generateAIResponse
                    .mockResolvedValue(
                        "AI response"
                    );

                const state = {
                    serializedPrompt:
                        "This is a private conversation.",

                    llmResponse:
                        null,

                    answer:
                        null,

                    trace: {
                        runId:
                            "test-run",

                        startedAt:
                            new Date(),

                        events: [],
                    },
                };

                await generateLLMResponse(
                    state
                );

                const event =
                    state.trace.events[0];

                expect(
                    event.metadata.prompt
                ).toBeUndefined();

                expect(
                    JSON.stringify(
                        event.metadata
                    )
                ).not.toContain(
                    "This is a private conversation."
                );
            }
        );

    }
);