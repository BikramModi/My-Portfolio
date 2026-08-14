import crypto from "crypto";

export function createTrace() {
    return {
        runId: crypto.randomUUID(),

        startedAt: new Date(),

        events: [],
    };
}

export function addTraceEvent(
    trace,
    {
        type,
        name,
        status = "completed",
        metadata = {},
    }
) {
    if (!trace) {
        throw new Error(
            "Trace is required."
        );
    }

    trace.events.push({
        eventId:
            crypto.randomUUID(),

        type,

        name,

        status,

        timestamp:
            new Date(),

        metadata,
    });

    return trace;
}