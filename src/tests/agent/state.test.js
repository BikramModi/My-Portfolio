import {
    describe,
    it,
    expect,
} from "@jest/globals";

import {
    createAgentState,
} from "../../../src/agent/state.js";

describe(
    "Agent State",
    () => {

        it(
            "should preserve request and trace correlation IDs",
            () => {
                const state =
                    createAgentState({
                        message:
                            "Hello",

                        user:
                            null,

                        conversationId:
                            "conversation-123",

                        requestId:
                            "request-123",
                    });

                expect(
                    state.requestId
                ).toBe(
                    "request-123"
                );

                expect(
                    state.trace.requestId
                ).toBe(
                    "request-123"
                );

                expect(
                    state.trace.runId
                ).toBeDefined();
            }
        );

    }
);