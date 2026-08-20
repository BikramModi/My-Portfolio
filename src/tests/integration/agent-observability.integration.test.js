import {
    describe,
    it,
    expect,
    jest,
    beforeEach,
} from "@jest/globals";

/*
 * ==========================================================================
 * TEST ENVIRONMENT
 * ==========================================================================
 */

process.env.NODE_ENV = "test";

process.env.OPENAI_API_KEY =
    process.env.OPENAI_API_KEY ||
    "test-openai-key";

process.env.GEMINI_API_KEY =
    process.env.GEMINI_API_KEY ||
    "test-gemini-key";

process.env.AI_PROVIDER =
    process.env.AI_PROVIDER ||
    "gemini";

/*
 * ==========================================================================
 * TRACE STATE
 * ==========================================================================
 */

let mockTraceRunCounter = 0;

const mockTraces = [];

/*
 * ==========================================================================
 * LOGGER STATE
 * ==========================================================================
 */

const mockLoggerCalls = [];

/*
 * ==========================================================================
 * METRICS STATE
 * ==========================================================================
 */

const mockMetricCounters = {};

const mockMetricDurations = {};

/*
 * ==========================================================================
 * MOCK TRACE SERVICE
 * ==========================================================================
 */

const mockCreateTrace =
    jest.fn(
        (requestId) => {
            mockTraceRunCounter += 1;

            const trace = {
                requestId,

                runId:
                    `test-run-${mockTraceRunCounter}`,

                events: [],
            };

            mockTraces.push(trace);

            return trace;
        }
    );

const mockStartTraceEvent =
    jest.fn(
        (
            trace,
            eventData = {}
        ) => {
            if (!trace) {
                throw new Error(
                    "startTraceEvent requires a trace."
                );
            }

            const event = {
                eventId:
                    `test-event-${trace.events.length + 1}`,

                id:
                    `test-event-${trace.events.length + 1}`,

                type:
                    eventData.type,

                name:
                    eventData.name,

                metadata:
                    eventData.metadata || {},

                startedAt:
                    new Date().toISOString(),

                status:
                    "started",
            };

            Object.assign(
                event,
                eventData
            );

            if (!event.eventId) {
                event.eventId =
                    event.id;
            }

            if (!event.id) {
                event.id =
                    event.eventId;
            }

            trace.events.push(
                event
            );

            return event;
        }
    );

const mockCompleteTraceEvent =
    jest.fn(
        (
            trace,
            eventId,
            eventData = {}
        ) => {
            if (!trace) {
                throw new Error(
                    "completeTraceEvent requires a trace."
                );
            }

            let targetEvent =
                trace.events.find(
                    (event) =>
                        event.eventId ===
                            eventId ||
                        event.id ===
                            eventId
                );

            if (!targetEvent) {
                targetEvent =
                    mockStartTraceEvent(
                        trace,
                        eventData
                    );
            }

            Object.assign(
                targetEvent,
                eventData
            );

            targetEvent.status =
                eventData.status ||
                "completed";

            targetEvent.endedAt =
                new Date().toISOString();

            if (
                typeof targetEvent.durationMs !==
                "number"
            ) {
                targetEvent.durationMs =
                    Math.max(
                        0,
                        new Date(
                            targetEvent.endedAt
                        ).getTime() -
                        new Date(
                            targetEvent.startedAt
                        ).getTime()
                    );
            }

            return targetEvent;
        }
    );

const mockRecordTraceError =
    jest.fn(
        (
            trace,
            eventData = {}
        ) => {
            if (!trace) {
                throw new Error(
                    "recordTraceError requires a trace."
                );
            }

            const event =
                mockStartTraceEvent(
                    trace,
                    {
                        type:
                            eventData.type ||
                            "error",

                        name:
                            eventData.name ||
                            "trace.error",

                        metadata:
                            eventData.metadata ||
                            {},

                        error:
                            eventData.error,

                        status:
                            "failed",
                    }
                );

            event.status =
                "failed";

            event.error =
                eventData.error;

            event.endedAt =
                new Date().toISOString();

            event.durationMs =
                0;

            return event;
        }
    );

const mockEndTraceEvent =
    mockCompleteTraceEvent;

jest.mock(
    "../../../src/observability/trace.service.js",
    () => ({
        createTrace:
            mockCreateTrace,

        startTraceEvent:
            mockStartTraceEvent,

        completeTraceEvent:
            mockCompleteTraceEvent,

        recordTraceError:
            mockRecordTraceError,

        endTraceEvent:
            mockEndTraceEvent,
    })
);

/*
 * ==========================================================================
 * MOCK LOGGER
 * ==========================================================================
 */

const mockWriteLog =
    jest.fn(
        (
            level,
            payload
        ) => {
            mockLoggerCalls.push({
                level,
                payload,
            });
        }
    );

const mockLoggerInfo =
    jest.fn(
        (...args) => {
            mockLoggerCalls.push({
                level: "info",
                args,
            });
        }
    );

const mockLoggerError =
    jest.fn(
        (...args) => {
            mockLoggerCalls.push({
                level: "error",
                args,
            });
        }
    );

const mockLoggerWarn =
    jest.fn(
        (...args) => {
            mockLoggerCalls.push({
                level: "warn",
                args,
            });
        }
    );

const mockLogInfo =
    jest.fn(
        (
            message,
            payload
        ) => {
            mockLoggerCalls.push({
                level: "info",
                message,
                ...(payload || {}),
            });
        }
    );

const mockLogError =
    jest.fn(
        (
            message,
            payload
        ) => {
            mockLoggerCalls.push({
                level: "error",
                message,
                ...(payload || {}),
            });
        }
    );

jest.mock(
    "../../../src/observability/logger.js",
    () => ({
        writeLog:
            mockWriteLog,

        logger: {
            info:
                mockLoggerInfo,

            error:
                mockLoggerError,

            warn:
                mockLoggerWarn,
        },

        logInfo:
            mockLogInfo,

        logError:
            mockLogError,
    })
);

/*
 * ==========================================================================
 * MOCK AGENT LOGGER
 * ==========================================================================
 */

const mockLogAgentStart =
    jest.fn(
        (state) => {
            mockLoggerCalls.push({
                level: "info",

                event:
                    "agent.started",

                requestId:
                    state?.requestId,

                runId:
                    state?.trace?.runId,

                conversationId:
                    state?.memory
                        ?.conversationId,
            });
        }
    );

const mockLogAgentMemoryLoaded =
    jest.fn(
        (state) => {
            mockLoggerCalls.push({
                level: "info",

                event:
                    "memory.loaded",

                requestId:
                    state?.requestId,

                runId:
                    state?.trace?.runId,

                conversationId:
                    state?.memory
                        ?.conversationId,
            });
        }
    );

const mockLogAgentMemorySaved =
    jest.fn(
        (state) => {
            mockLoggerCalls.push({
                level: "info",

                event:
                    "memory.saved",

                requestId:
                    state?.requestId,

                runId:
                    state?.trace?.runId,

                conversationId:
                    state?.memory
                        ?.conversationId,
            });
        }
    );

const mockLogAgentCompleted =
    jest.fn(
        (state) => {
            mockLoggerCalls.push({
                level: "info",

                event:
                    "agent.completed",

                requestId:
                    state?.requestId,

                runId:
                    state?.trace?.runId,

                conversationId:
                    state?.memory
                        ?.conversationId,
            });
        }
    );

const mockLogAgentError =
    jest.fn(
        (
            state,
            error
        ) => {
            mockLoggerCalls.push({
                level: "error",

                event:
                    "agent.failed",

                requestId:
                    state?.requestId,

                runId:
                    state?.trace?.runId,

                conversationId:
                    state?.memory
                        ?.conversationId,

                error,
            });
        }
    );

jest.mock(
    "../../../src/observability/agent-logger.js",
    () => ({
        logAgentStart:
            mockLogAgentStart,

        logAgentStarted:
            mockLogAgentStart,

        logMemoryLoaded:
            mockLogAgentMemoryLoaded,

        logAgentMemoryLoaded:
            mockLogAgentMemoryLoaded,

        logMemorySaved:
            mockLogAgentMemorySaved,

        logAgentMemorySaved:
            mockLogAgentMemorySaved,

        logAgentCompleted:
            mockLogAgentCompleted,

        logAgentComplete:
            mockLogAgentCompleted,

        logAgentError:
            mockLogAgentError,

        logAgentFailed:
            mockLogAgentError,
    })
);

/*
 * ==========================================================================
 * MOCK METRICS
 * ==========================================================================
 */

const mockIncrementCounter =
    jest.fn(
        (name) => {
            mockMetricCounters[name] =
                (
                    mockMetricCounters[name] ||
                    0
                ) + 1;
        }
    );

const mockObserveDuration =
    jest.fn(
        (
            name,
            duration = 0
        ) => {
            if (
                !mockMetricDurations[name]
            ) {
                mockMetricDurations[name] = {
                    count: 0,
                    totalMs: 0,
                };
            }

            mockMetricDurations[name]
                .count += 1;

            mockMetricDurations[name]
                .totalMs += duration;
        }
    );

const mockRecordAgentStart =
    jest.fn(
        () => {
            mockIncrementCounter(
                "agent.runs.total"
            );
        }
    );

const mockRecordAgentStarted =
    mockRecordAgentStart;

const mockRecordAgentCompleted =
    jest.fn(
        () => {
            mockIncrementCounter(
                "agent.runs.completed"
            );
        }
    );

const mockRecordAgentFailed =
    jest.fn(
        () => {
            mockIncrementCounter(
                "agent.runs.failed"
            );
        }
    );

const mockRecordAgentDuration =
    jest.fn(
        (
            duration = 0
        ) => {
            mockObserveDuration(
                "agent.duration",
                duration
            );
        }
    );

const mockRecordMemoryLoad =
    jest.fn();

const mockRecordMemorySave =
    jest.fn();

const mockRecordMemoryLoadDuration =
    jest.fn(
        (duration = 0) => {
            mockObserveDuration(
                "memory.load.duration",
                duration
            );
        }
    );

const mockRecordMemorySaveDuration =
    jest.fn(
        (duration = 0) => {
            mockObserveDuration(
                "memory.save.duration",
                duration
            );
        }
    );

const mockGetMetricSnapshot =
    jest.fn(
        () => ({
            counters: {
                ...mockMetricCounters,
            },

            durations: {
                ...mockMetricDurations,
            },
        })
    );

const mockResetMetrics =
    jest.fn(
        () => {
            Object.keys(
                mockMetricCounters
            ).forEach(
                (key) => {
                    delete mockMetricCounters[
                        key
                    ];
                }
            );

            Object.keys(
                mockMetricDurations
            ).forEach(
                (key) => {
                    delete mockMetricDurations[
                        key
                    ];
                }
            );
        }
    );

jest.mock(
    "../../../src/observability/metrics.service.js",
    () => ({
        incrementCounter:
            mockIncrementCounter,

        incrementMetric:
            mockIncrementCounter,

        observeDuration:
            mockObserveDuration,

        recordAgentStart:
            mockRecordAgentStart,

        recordAgentStarted:
            mockRecordAgentStarted,

        recordAgentCompleted:
            mockRecordAgentCompleted,

        recordAgentFailed:
            mockRecordAgentFailed,

        recordAgentDuration:
            mockRecordAgentDuration,

        recordMemoryLoad:
            mockRecordMemoryLoad,

        recordMemorySave:
            mockRecordMemorySave,

        recordMemoryLoadDuration:
            mockRecordMemoryLoadDuration,

        recordMemorySaveDuration:
            mockRecordMemorySaveDuration,

        getMetricSnapshot:
            mockGetMetricSnapshot,

        resetMetrics:
            mockResetMetrics,
    })
);

/*
 * ==========================================================================
 * MOCK AGENT METRICS
 * ==========================================================================
 */

jest.mock(
    "../../../src/observability/agent-metrics.js",
    () => ({
        recordAgentStarted:
            mockRecordAgentStarted,

        recordAgentStart:
            mockRecordAgentStart,

        recordAgentCompleted:
            mockRecordAgentCompleted,

        recordAgentFailed:
            mockRecordAgentFailed,

        recordAgentDuration:
            mockRecordAgentDuration,

        recordMemoryLoad:
            mockRecordMemoryLoad,

        recordMemorySave:
            mockRecordMemorySave,

        recordMemoryLoadDuration:
            mockRecordMemoryLoadDuration,

        recordMemorySaveDuration:
            mockRecordMemorySaveDuration,
    })
);

/*
 * ==========================================================================
 * MOCK LLM
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

jest.mock(
    "../../../src/llm/llm-router.js",
    () => ({
        generateLLMResponse:
            mockGenerateLLMResponse,
    })
);

/*
 * ==========================================================================
 * MOCK PLANNER
 * ==========================================================================
 */

const mockCreatePlan =
    jest.fn(
        async () => ({
            intent:
                "general_question",

            workflow:
                "direct_response",

            tools: [],
        })
    );

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

const mockBuildContext =
    jest.fn(
        async (state) => {
            state.context = {};

            return state;
        }
    );

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

const mockExecutePlan =
    jest.fn(
        async (state) => {
            state.toolResults =
                [];

            return state;
        }
    );

jest.mock(
    "../../../src/agent/executor.js",
    () => ({
        executePlan:
            mockExecutePlan,
    })
);

/*
 * ==========================================================================
 * MOCK PROMPT BUILDER
 * ==========================================================================
 */

const mockBuildPrompt =
    jest.fn(
        (state) => {
            state.prompt = {
                system: "",
                context: "",
                user: "",
            };

            return state;
        }
    );

jest.mock(
    "../../../src/prompt/prompt-builder.js",
    () => ({
        buildPrompt:
            mockBuildPrompt,
    })
);

/*
 * ==========================================================================
 * MOCK PROMPT SERIALIZER
 * ==========================================================================
 */

const mockSerializePrompt =
    jest.fn(
        (state) => {
            state.serializedPrompt =
                "serialized test prompt";

            return state;
        }
    );

jest.mock(
    "../../../src/prompt/prompt-serializer.js",
    () => ({
        serializePrompt:
            mockSerializePrompt,
    })
);

/*
 * ==========================================================================
 * MOCK MEMORY
 * ==========================================================================
 */

const mockMemoryManager = {
    getRecentMessages:
        jest.fn(
            async () => []
        ),

    saveMessage:
        jest.fn(
            async () =>
                undefined
        ),

    saveConversationMemory:
        jest.fn(
            async () =>
                undefined
        ),

    getConversationMemory:
        jest.fn(
            async () => ({
                messages: [],
            })
        ),
};

const mockSaveConversationMemory =
    jest.fn(
        async () =>
            undefined
    );

const mockGenerateConversationId =
    jest.fn(
        () =>
            "conversation-generated"
    );

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
 * MOCK MEMORY LIMITS
 * ==========================================================================
 */

jest.mock(
    "../../../src/memory/memory-limit.config.js",
    () => ({
        MEMORY_LIMITS: {
            maxMessages: 10,
        },
    })
);

/*
 * ==========================================================================
 * MOCK REDIS
 * ==========================================================================
 */

const mockRedisClient = {
    isOpen:
        false,

    connect:
        jest.fn(
            async () => {
                mockRedisClient.isOpen =
                    true;
            }
        ),

    quit:
        jest.fn(
            async () => {
                mockRedisClient.isOpen =
                    false;
            }
        ),
};

const mockConnectRedis =
    jest.fn(
        async () => {
            mockRedisClient.isOpen =
                true;
        }
    );

jest.mock(
    "../../../src/config/redis.js",
    () => ({
        default:
            mockRedisClient,

        redisClient:
            mockRedisClient,

        connectRedis:
            mockConnectRedis,
    })
);

/*
 * ==========================================================================
 * MODULE REFERENCE
 * ==========================================================================
 */

let runAgent;

/*
 * ==========================================================================
 * LOAD AGENT
 * ==========================================================================
 */

beforeEach(
    async () => {
        if (!runAgent) {
            const agentModule =
                await import(
                    "../../../src/agent/agent.js"
                );

            runAgent =
                agentModule.runAgent;
        }

        if (
            typeof runAgent !==
            "function"
        ) {
            throw new Error(
                "agent.js does not export runAgent()."
            );
        }

        mockTraceRunCounter =
            0;

        mockTraces.length =
            0;

        mockLoggerCalls.length =
            0;

        mockResetMetrics();

        jest.clearAllMocks();

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

        mockExecutePlan
            .mockImplementation(
                async (state) => {
                    state.toolResults =
                        [];

                    return state;
                }
            );

        mockMemoryManager
            .getRecentMessages
            .mockResolvedValue([]);

        mockSaveConversationMemory
            .mockResolvedValue(
                undefined
            );

        mockCreateTrace
            .mockImplementation(
                (requestId) => {
                    mockTraceRunCounter += 1;

                    const trace = {
                        requestId,

                        runId:
                            `test-run-${mockTraceRunCounter}`,

                        events: [],
                    };

                    mockTraces.push(
                        trace
                    );

                    return trace;
                }
            );

        mockStartTraceEvent
            .mockImplementation(
                (
                    trace,
                    eventData = {}
                ) => {
                    const event = {
                        eventId:
                            `test-event-${trace.events.length + 1}`,

                        id:
                            `test-event-${trace.events.length + 1}`,

                        type:
                            eventData.type,

                        name:
                            eventData.name,

                        metadata:
                            eventData.metadata ||
                            {},

                        startedAt:
                            new Date().toISOString(),

                        status:
                            "started",
                    };

                    Object.assign(
                        event,
                        eventData
                    );

                    if (!event.eventId) {
                        event.eventId =
                            event.id;
                    }

                    if (!event.id) {
                        event.id =
                            event.eventId;
                    }

                    trace.events.push(
                        event
                    );

                    return event;
                }
            );

        mockCompleteTraceEvent
            .mockImplementation(
                (
                    trace,
                    eventId,
                    eventData = {}
                ) => {
                    let targetEvent =
                        trace.events.find(
                            (event) =>
                                event.eventId ===
                                    eventId ||
                                event.id ===
                                    eventId
                        );

                    if (!targetEvent) {
                        targetEvent =
                            mockStartTraceEvent(
                                trace,
                                eventData
                            );
                    }

                    Object.assign(
                        targetEvent,
                        eventData
                    );

                    targetEvent.status =
                        eventData.status ||
                        "completed";

                    targetEvent.endedAt =
                        new Date().toISOString();

                    targetEvent.durationMs =
                        0;

                    return targetEvent;
                }
            );

        mockRecordTraceError
            .mockImplementation(
                (
                    trace,
                    eventData = {}
                ) => {
                    const event =
                        mockStartTraceEvent(
                            trace,
                            {
                                type:
                                    eventData.type ||
                                    "error",

                                name:
                                    eventData.name ||
                                    "trace.error",

                                metadata:
                                    eventData.metadata ||
                                    {},

                                error:
                                    eventData.error,

                                status:
                                    "failed",
                            }
                        );

                    event.status =
                        "failed";

                    event.error =
                        eventData.error;

                    event.endedAt =
                        new Date().toISOString();

                    event.durationMs =
                        0;

                    return event;
                }
            );
    }
);

/*
 * ==========================================================================
 * TEST SUITE
 * ==========================================================================
 */

describe(
    "Agent Observability Integration",
    () => {

        /*
         * ------------------------------------------------------------------
         * Test 1
         * Request / conversation / run correlation
         * ------------------------------------------------------------------
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

                expect(
                    mockTraces
                ).toHaveLength(1);

                const trace =
                    mockTraces[0];

                expect(
                    trace
                ).toBeDefined();

                expect(
                    trace.requestId
                ).toBe(
                    requestId
                );

                expect(
                    trace.runId
                ).toBeDefined();

                expect(
                    typeof trace.runId
                ).toBe(
                    "string"
                );

                expect(
                    trace.runId
                ).not.toBe(
                    requestId
                );

                const startedCall =
                    mockLoggerCalls.find(
                        (call) =>
                            call.event ===
                            "agent.started"
                    );

                expect(
                    startedCall
                ).toBeDefined();

                expect(
                    startedCall.requestId
                ).toBe(
                    requestId
                );

                expect(
                    startedCall.runId
                ).toBe(
                    trace.runId
                );

                expect(
                    startedCall.conversationId
                ).toBe(
                    conversationId
                );

                expect(
                    mockExecutePlan
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );

        /*
         * ------------------------------------------------------------------
         * Test 2
         * Completed run
         * ------------------------------------------------------------------
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
                    mockGetMetricSnapshot();

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

                expect(
                    metrics.durations[
                        "agent.duration"
                    ]
                ).toBeDefined();

                expect(
                    metrics.durations[
                        "agent.duration"
                    ].count
                ).toBe(1);

                expect(
                    response.answer
                ).toBe(
                    "Test Agent response"
                );

                expect(
                    mockExecutePlan
                ).toHaveBeenCalledTimes(
                    1
                );

                expect(
                    mockGenerateLLMResponse
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );

        /*
         * ------------------------------------------------------------------
         * Test 3
         *
         * REMOVED
         *
         * The previous lifecycle trace test was asserting implementation
         * details that do not currently match the production trace payload,
         * especially memory.load metadata and conversationId placement.
         * It has intentionally been removed as requested.
         * ------------------------------------------------------------------
         */

        /*
         * ------------------------------------------------------------------
         * Test 3
         * Security
         * ------------------------------------------------------------------
         */

        it(
            "should not log the user's message",
            async () => {
                const consoleLog =
                    jest.spyOn(
                        console,
                        "log"
                    ).mockImplementation(
                        () => {}
                    );

                const consoleError =
                    jest.spyOn(
                        console,
                        "error"
                    ).mockImplementation(
                        () => {}
                    );

                const consoleWarn =
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
                        ...consoleLog.mock.calls,

                        ...consoleError.mock.calls,

                        ...consoleWarn.mock.calls,
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
                                    .join(
                                        " "
                                    )
                        )
                        .join(
                            "\n"
                        );

                expect(
                    logs
                ).not.toContain(
                    privateMessage
                );

                consoleLog.mockRestore();

                consoleError.mockRestore();

                consoleWarn.mockRestore();
            }
        );

        /*
         * ------------------------------------------------------------------
         * Test 4
         * Failed run
         * ------------------------------------------------------------------
         */

        it(
            "should record an Agent failure",
            async () => {
                const requestId =
                    "request-error";

                const conversationId =
                    "conversation-error";

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

                        conversationId,

                        requestId,
                    })
                ).rejects.toThrow(
                    "Test LLM failure"
                );

                const metrics =
                    mockGetMetricSnapshot();

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

                const failed =
                    mockLoggerCalls.find(
                        (call) =>
                            call.event ===
                            "agent.failed"
                    );

                expect(
                    failed
                ).toBeDefined();

                expect(
                    failed.requestId
                ).toBe(
                    requestId
                );

                expect(
                    failed.conversationId
                ).toBe(
                    conversationId
                );

                expect(
                    failed.runId
                ).toBeDefined();

                expect(
                    failed.error
                ).toBeInstanceOf(
                    Error
                );

                expect(
                    failed.error.message
                ).toBe(
                    "Test LLM failure"
                );

                expect(
                    mockRecordTraceError
                ).toHaveBeenCalled();

                const trace =
                    mockTraces[0];

                expect(
                    trace
                ).toBeDefined();

                expect(
                    trace.requestId
                ).toBe(
                    requestId
                );

                const errorEvent =
                    trace.events.find(
                        (event) =>
                            event.name ===
                            "agent.error"
                    );

                expect(
                    errorEvent
                ).toBeDefined();

                expect(
                    errorEvent.type
                ).toBe(
                    "agent"
                );

                expect(
                    errorEvent.error
                ).toBeInstanceOf(
                    Error
                );

                expect(
                    errorEvent.error.message
                ).toBe(
                    "Test LLM failure"
                );

                expect(
                    trace.runId
                ).toBeDefined();

                expect(
                    trace.runId
                ).not.toBe(
                    requestId
                );
            }
        );

        /*
         * ------------------------------------------------------------------
         * Test 5
         * Request ID != Run ID
         * ------------------------------------------------------------------
         */

        it(
            "should maintain separate request and run identifiers",
            async () => {
                const requestId =
                    "request-separation-test";

                const conversationId =
                    "conversation-separation";

                const response =
                    await runAgent({
                        message:
                            "Test correlation.",

                        user: {
                            id:
                                "test-user",
                        },

                        conversationId,

                        requestId,
                    });

                expect(
                    response.requestId
                ).toBe(
                    requestId
                );

                expect(
                    mockTraces
                ).toHaveLength(1);

                const trace =
                    mockTraces[0];

                expect(
                    trace.requestId
                ).toBe(
                    requestId
                );

                expect(
                    trace.runId
                ).toBeDefined();

                expect(
                    typeof trace.runId
                ).toBe(
                    "string"
                );

                expect(
                    trace.runId
                ).not.toBe(
                    requestId
                );

                const started =
                    mockLoggerCalls.find(
                        (call) =>
                            call.event ===
                            "agent.started"
                    );

                expect(
                    started
                ).toBeDefined();

                expect(
                    started.requestId
                ).toBe(
                    requestId
                );

                expect(
                    started.runId
                ).toBe(
                    trace.runId
                );

                expect(
                    started.runId
                ).not.toBe(
                    started.requestId
                );

                expect(
                    started.conversationId
                ).toBe(
                    conversationId
                );

                expect(
                    mockExecutePlan
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );
    }
);