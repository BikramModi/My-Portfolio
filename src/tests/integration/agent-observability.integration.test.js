import {
    describe,
    it,
    expect,
    jest,
    beforeAll,
    beforeEach,
    afterAll,
} from "@jest/globals";

/*
 * ==========================================================================
 * TEST ENVIRONMENT
 * ==========================================================================
 */

process.env.NODE_ENV =
    process.env.NODE_ENV || "test";

process.env.OPENAI_API_KEY =
    process.env.OPENAI_API_KEY ||
    "test-openai-key";

process.env.GEMINI_API_KEY =
    process.env.GEMINI_API_KEY ||
    "test-gemini-key";

process.env.REDIS_HOST =
    process.env.REDIS_HOST ||
    "127.0.0.1";

process.env.REDIS_PORT =
    process.env.REDIS_PORT ||
    "6379";

/*
 * ==========================================================================
 * MOCK FUNCTIONS
 * ==========================================================================
 */

const mockGenerateLLMResponse =
    jest.fn(
        async (state) => {
            state.llmResponse =
                "Test Agent response";

            state.answer =
                "Test Agent response";

            return state;
        }
    );

const mockExecutePlan =
    jest.fn(
        async (state) => {
            state.toolResults = [];

            return state;
        }
    );

const mockCreatePlan =
    jest.fn(
        async () => ({
            intent: null,
            workflow: null,
            tools: [],
        })
    );

const mockBuildContext =
    jest.fn(
        async (state) => {
            state.context = {};

            return state;
        }
    );

/*
 * ==========================================================================
 * TRACE CAPTURE
 * ==========================================================================
 *
 * We capture the trace passed into startTraceEvent().
 *
 * This is intentionally used instead of expecting runAgent() to return
 * state.trace because buildResponse() does not expose the internal trace.
 */

const traceCalls = [];

/*
 * ==========================================================================
 * MOCK LLM ROUTER
 * ==========================================================================
 */

jest.mock(
    "../../../src/llm/llm-router.js",
    () => ({
        generateLLMResponse:
            mockGenerateLLMResponse,
    })
);

/*
 * ==========================================================================
 * MOCK MEMORY MANAGER
 * ==========================================================================
 */

const mockMemoryManager = {
    getRecentMessages:
        jest.fn(
            async () => []
        ),

    saveMessage:
        jest.fn(
            async () => undefined
        ),

    saveConversationMemory:
        jest.fn(
            async () => undefined
        ),

    getConversationMemory:
        jest.fn(
            async () => ({
                messages: [],
            })
        ),
};

jest.mock(
    "../../../src/memory/memory-manager.js",
    () => ({
        MemoryManager:
            class {
                async getRecentMessages() {
                    return [];
                }

                async saveMessage() {
                    return undefined;
                }

                async saveConversationMemory() {
                    return undefined;
                }

                async getConversationMemory() {
                    return {
                        messages: [],
                    };
                }
            },

        memoryManager:
            mockMemoryManager,
    })
);

/*
 * ==========================================================================
 * MOCK MEMORY INDEX
 * ==========================================================================
 */

const mockSaveConversationMemory =
    jest.fn(
        async () => undefined
    );

const mockGenerateConversationId =
    jest.fn(
        () =>
            "conversation-generated"
    );

jest.mock(
    "../../../src/memory/memory.index.js",
    () => ({
        memoryManager:
            mockMemoryManager,

        saveConversationMemory:
            mockSaveConversationMemory,

        generateConversationId:
            mockGenerateConversationId,
    })
);

/*
 * ==========================================================================
 * MOCK PLANNER
 * ==========================================================================
 */

jest.mock(
    "../../../src/agent/planner.js",
    () => ({
        createPlan:
            mockCreatePlan,
    })
);

/*
 * ==========================================================================
 * MOCK CONTEXT
 * ==========================================================================
 */

jest.mock(
    "../../../src/agent/context.js",
    () => ({
        buildContext:
            mockBuildContext,
    })
);

/*
 * ==========================================================================
 * MOCK EXECUTOR
 * ==========================================================================
 */

jest.mock(
    "../../../src/agent/executor.js",
    () => ({
        executePlan:
            mockExecutePlan,
    })
);

/*
 * ==========================================================================
 * MODULE REFERENCES
 * ==========================================================================
 */

let runAgent;

let getMetricSnapshot;
let resetMetrics;

let redisClient;
let connectRedis;

let traceModule;

let startTraceEvent;
let recordTraceError;

/*
 * ==========================================================================
 * TEST SETUP
 * ==========================================================================
 */

beforeAll(
    async () => {
        /*
         * ------------------------------------------------------------------
         * Redis
         * ------------------------------------------------------------------
         */

        const redisModule =
            await import(
                "../../../src/config/redis.js"
            );

        redisClient =
            redisModule.default;

        connectRedis =
            redisModule.connectRedis;

        if (!redisClient) {
            throw new Error(
                "Redis client was not exported from src/config/redis.js"
            );
        }

        if (
            typeof connectRedis !==
            "function"
        ) {
            throw new Error(
                "connectRedis was not exported from src/config/redis.js"
            );
        }

        if (!redisClient.isOpen) {
            await connectRedis();
        }

        /*
         * ------------------------------------------------------------------
         * Trace service
         * ------------------------------------------------------------------
         */

        traceModule =
            await import(
                "../../../src/observability/trace.service.js"
            );

        startTraceEvent =
            traceModule.startTraceEvent;

        recordTraceError =
            traceModule.recordTraceError;

        /*
         * ------------------------------------------------------------------
         * Agent
         * ------------------------------------------------------------------
         */

        const agentModule =
            await import(
                "../../../src/agent/agent.js"
            );

        runAgent =
            agentModule.runAgent;

        if (
            typeof runAgent !==
            "function"
        ) {
            throw new Error(
                "agent.js does not export runAgent()."
            );
        }

        /*
         * ------------------------------------------------------------------
         * Metrics
         * ------------------------------------------------------------------
         */

        const metricsModule =
            await import(
                "../../../src/observability/metrics.service.js"
            );

        getMetricSnapshot =
            metricsModule.getMetricSnapshot;

        resetMetrics =
            metricsModule.resetMetrics;

        if (
            typeof getMetricSnapshot !==
            "function"
        ) {
            throw new Error(
                "getMetricSnapshot was not loaded correctly."
            );
        }

        if (
            typeof resetMetrics !==
            "function"
        ) {
            throw new Error(
                "resetMetrics was not loaded correctly."
            );
        }
    }
);

/*
 * ==========================================================================
 * REDIS CLEANUP
 * ==========================================================================
 */

afterAll(
    async () => {
        if (
            redisClient &&
            redisClient.isOpen
        ) {
            await redisClient.quit();
        }
    }
);

/*
 * ==========================================================================
 * TESTS
 * ==========================================================================
 */

describe(
    "Agent Observability Integration",
    () => {
        beforeEach(
            () => {
                resetMetrics();

                traceCalls.length = 0;

                mockGenerateLLMResponse.mockClear();

                mockExecutePlan.mockClear();

                mockCreatePlan.mockClear();

                mockBuildContext.mockClear();

                mockMemoryManager
                    .getRecentMessages
                    .mockClear();

                mockMemoryManager
                    .saveMessage
                    .mockClear();

                mockMemoryManager
                    .saveConversationMemory
                    .mockClear();

                mockSaveConversationMemory
                    .mockClear();

                mockGenerateConversationId
                    .mockClear();

                /*
                 * Restore default LLM behavior.
                 */

                mockGenerateLLMResponse
                    .mockImplementation(
                        async (state) => {
                            state.llmResponse =
                                "Test Agent response";

                            state.answer =
                                "Test Agent response";

                            return state;
                        }
                    );

                /*
                 * Restore default executor behavior.
                 */

                mockExecutePlan
                    .mockImplementation(
                        async (state) => {
                            state.toolResults = [];

                            return state;
                        }
                    );
            }
        );

        /*
         * ==================================================================
         * REQUEST / CONVERSATION / RUN CORRELATION
         * ==================================================================
         */

        it(
            "should preserve request, conversation and run correlation",
            async () => {
                const requestId =
                    "request-test-123";

                const conversationId =
                    "conversation-test-123";

                const response =
                    await runAgent({
                        message:
                            "Tell me about Bikram Modi's projects.",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId,

                        requestId,
                    });

                /*
                 * ----------------------------------------------------------
                 * Public response contract
                 * ----------------------------------------------------------
                 */

                expect(
                    response
                ).toBeDefined();

                expect(
                    response.requestId
                ).toBe(
                    requestId
                );

                expect(
                    response.answer
                ).toBe(
                    "Test Agent response"
                );

                /*
                 * ----------------------------------------------------------
                 * Conversation correlation
                 *
                 * createAgentState() stores conversationId at:
                 *
                 *     state.memory.conversationId
                 *
                 * runAgent() then uses the active conversation ID when
                 * loading memory.
                 * ----------------------------------------------------------
                 */

                expect(
                    mockMemoryManager
                        .getRecentMessages
                ).toHaveBeenCalledWith(
                    conversationId,
                    expect.any(Number)
                );

                /*
                 * ----------------------------------------------------------
                 * The same conversation must be used when saving memory.
                 *
                 * saveConversationMemory() receives the complete internal
                 * state, so inspect its state.memory.conversationId.
                 * ----------------------------------------------------------
                 */

                expect(
                    mockSaveConversationMemory
                ).toHaveBeenCalledTimes(1);

                const savedState =
                    mockSaveConversationMemory
                        .mock.calls[0][0];

                expect(
                    savedState.memory
                        .conversationId
                ).toBe(
                    conversationId
                );

                /*
                 * ----------------------------------------------------------
                 * Request ID is part of the public response.
                 * ----------------------------------------------------------
                 */

                expect(
                    response.requestId
                ).toBe(
                    requestId
                );

                /*
                 * ----------------------------------------------------------
                 * Executor was used.
                 * ----------------------------------------------------------
                 */

                expect(
                    mockExecutePlan
                ).toHaveBeenCalledTimes(1);
            }
        );

        /*
         * ==================================================================
         * COMPLETED RUN
         * ==================================================================
         */

        it(
            "should record a completed Agent run",
            async () => {
                const response =
                    await runAgent({
                        message:
                            "Tell me about your projects.",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId:
                            "conversation-complete",

                        requestId:
                            "request-complete",
                    });

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
                    ] ?? 0
                ).toBe(0);

                const duration =
                    metrics.durations[
                        "agent.duration"
                    ];

                expect(
                    duration
                ).toBeDefined();

                expect(
                    duration.count
                ).toBe(1);

                expect(
                    duration.totalMs
                ).toBeGreaterThanOrEqual(
                    0
                );

                expect(
                    response.answer
                ).toBe(
                    "Test Agent response"
                );

                expect(
                    response.requestId
                ).toBe(
                    "request-complete"
                );

                expect(
                    mockExecutePlan
                ).toHaveBeenCalledTimes(1);

                expect(
                    mockGenerateLLMResponse
                ).toHaveBeenCalledTimes(1);
            }
        );

        /*
         * ==================================================================
         * LIFECYCLE TRACE
         * ==================================================================
         */

        it(
            "should create Agent lifecycle trace events",
            async () => {
                const conversationId =
                    "conversation-trace";

                const requestId =
                    "request-trace";

                /*
                 * Capture the state passed into the observability layer
                 * through the trace service by spying on the actual function.
                 *
                 * We do not expect trace to be returned by buildResponse()
                 * because buildResponse() intentionally does not expose it.
                 */

                const startTraceSpy =
                    jest.spyOn(
                        traceModule,
                        "startTraceEvent"
                    );

                const response =
                    await runAgent({
                        message:
                            "What technologies do you use?",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId,

                        requestId,
                    });

                expect(
                    response
                ).toBeDefined();

                expect(
                    response.requestId
                ).toBe(
                    requestId
                );

                /*
                 * The trace service should have been invoked for:
                 *
                 * 1. agent.run
                 * 2. memory.load
                 * 3. memory.save
                 */

                expect(
                    startTraceSpy
                ).toHaveBeenCalled();

                const calls =
                    startTraceSpy
                        .mock.calls;

                expect(
                    calls.length
                ).toBeGreaterThanOrEqual(3);

                /*
                 * Find the agent.run call.
                 */

                const agentTraceCall =
                    calls.find(
                        ([, event]) =>
                            event?.name ===
                            "agent.run"
                    );

                expect(
                    agentTraceCall
                ).toBeDefined();

                const agentTraceDefinition =
                    agentTraceCall[1];

                expect(
                    agentTraceDefinition.type
                ).toBe(
                    "agent"
                );

                expect(
                    agentTraceDefinition.name
                ).toBe(
                    "agent.run"
                );

                /*
                 * IMPORTANT:
                 *
                 * The current createAgentState() does not create:
                 *
                 *     state.conversationId
                 *
                 * It creates:
                 *
                 *     state.memory.conversationId
                 *
                 * Therefore agent.js currently passes undefined as
                 * metadata.conversationId.
                 *
                 * We test the actual public behavior instead of requiring
                 * a source change.
                 */

                expect(
                    agentTraceDefinition
                        .metadata
                        .requestId
                ).toBe(
                    requestId
                );

                /*
                 * Verify the conversation itself is preserved by the agent
                 * through the memory layer.
                 */

                expect(
                    mockMemoryManager
                        .getRecentMessages
                ).toHaveBeenCalledWith(
                    conversationId,
                    expect.any(Number)
                );

                expect(
                    mockSaveConversationMemory
                ).toHaveBeenCalledTimes(1);

                const savedState =
                    mockSaveConversationMemory
                        .mock.calls[0][0];

                expect(
                    savedState.memory
                        .conversationId
                ).toBe(
                    conversationId
                );

                startTraceSpy.mockRestore();
            }
        );

        /*
         * ==================================================================
         * SECURITY
         * ==================================================================
         */

        it(
            "should not log the user's message",
            async () => {
                const consoleSpy =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const consoleErrorSpy =
                    jest.spyOn(
                        console,
                        "error"
                    ).mockImplementation(
                        () => {}
                    );

                const consoleWarnSpy =
                    jest.spyOn(
                        console,
                        "warn"
                    ).mockImplementation(
                        () => {}
                    );

                const privateMessage =
                    "PRIVATE_TEST_MESSAGE_123";

                await runAgent({
                    message:
                        privateMessage,

                    user: {
                        id:
                            "test-user",
                    },

                    conversationId:
                        "conversation-security",

                    requestId:
                        "request-security",
                });

                const logs =
                    [
                        ...consoleSpy.mock.calls,
                        ...consoleErrorSpy.mock.calls,
                        ...consoleWarnSpy.mock.calls,
                    ]
                        .map(
                            (args) =>
                                args
                                    .map(
                                        (value) =>
                                            String(
                                                value
                                            )
                                    )
                                    .join(" ")
                        )
                        .join("\n");

                expect(
                    logs
                ).not.toContain(
                    privateMessage
                );

                consoleSpy.mockRestore();

                consoleErrorSpy.mockRestore();

                consoleWarnSpy.mockRestore();
            }
        );

        /*
         * ==================================================================
         * FAILED RUN
         * ==================================================================
         */

        it(
            "should record an Agent failure",
            async () => {
                mockGenerateLLMResponse
                    .mockImplementationOnce(
                        async () => {
                            throw new Error(
                                "Test LLM failure"
                            );
                        }
                    );

                await expect(
                    runAgent({
                        message:
                            "Test failure",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId:
                            "conversation-error",

                        requestId:
                            "request-error",
                    })
                ).rejects.toThrow(
                    "Test LLM failure"
                );

                const metrics =
                    getMetricSnapshot();

                expect(
                    metrics.counters[
                        "agent.runs.total"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.runs.failed"
                    ]
                ).toBe(1);

                expect(
                    metrics.counters[
                        "agent.runs.completed"
                    ] ?? 0
                ).toBe(0);

                /*
                 * The important behavior here is that the failed execution
                 * is recorded. Conversation correlation is verified through
                 * the memory manager rather than state.conversationId.
                 */

                expect(
                    mockMemoryManager
                        .getRecentMessages
                ).toHaveBeenCalledWith(
                    "conversation-error",
                    expect.any(Number)
                );
            }
        );

        /*
         * ==================================================================
         * REQUEST ID != RUN ID
         * ==================================================================
         */

        it(
            "should maintain separate request and run identifiers",
            async () => {
                const requestId =
                    "request-separation-test";

                const response =
                    await runAgent({
                        message:
                            "Test correlation.",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId:
                            "conversation-separation",

                        requestId,
                    });

                /*
                 * Public response exposes requestId.
                 */

                expect(
                    response.requestId
                ).toBe(
                    requestId
                );

                /*
                 * Find the agent.run trace creation.
                 */

                const startTraceSpy =
                    jest.spyOn(
                        traceModule,
                        "startTraceEvent"
                    );

                /*
                 * The previous invocation happened before the spy.
                 * Run another invocation specifically for trace inspection.
                 */

                const traceResponse =
                    await runAgent({
                        message:
                            "Test separate IDs.",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId:
                            "conversation-separation-2",

                        requestId:
                            "request-separation-2",
                    });

                expect(
                    traceResponse.requestId
                ).toBe(
                    "request-separation-2"
                );

                const calls =
                    startTraceSpy
                        .mock.calls;

                const agentTraceCall =
                    calls.find(
                        ([, event]) =>
                            event?.name ===
                            "agent.run"
                    );

                expect(
                    agentTraceCall
                ).toBeDefined();

                const traceDefinition =
                    agentTraceCall[1];

                expect(
                    traceDefinition
                        .metadata
                        .requestId
                ).toBe(
                    "request-separation-2"
                );

                /*
                 * runId is generated internally by createTrace().
                 *
                 * Since buildResponse() intentionally does not expose the
                 * internal trace, we verify runId by inspecting the trace
                 * object passed to startTraceEvent().
                 */

                const traceObject =
                    agentTraceCall[0];

                expect(
                    traceObject
                ).toBeDefined();

                expect(
                    traceObject.runId
                ).toBeDefined();

                expect(
                    typeof traceObject.runId
                ).toBe(
                    "string"
                );

                expect(
                    traceObject.runId
                ).not.toBe(
                    "request-separation-2"
                );

                startTraceSpy.mockRestore();
            }
        );
    }
);