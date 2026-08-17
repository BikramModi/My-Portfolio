import crypto from "crypto";

export function createTrace( requestId = null ) {
    return {
        runId:
            crypto.randomUUID(),

        requestId,

        startedAt:
            new Date(),

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

    const event = {
        eventId:
            crypto.randomUUID(),

        type,

        name,

        status,

        startedAt:
            new Date(),

        completedAt:
            status === "completed"
                ? new Date()
                : null,

        durationMs:
            null,

        metadata,
    };

    trace.events.push(event);

    return event;
}

export function startTraceEvent(
    trace,
    {
        type,
        name,
        metadata = {},
    }
) {
    if (!trace) {
        throw new Error(
            "Trace is required."
        );
    }

    const event = {
        eventId:
            crypto.randomUUID(),

        type,

        name,

        status: "started",

        startedAt:
            new Date(),

        completedAt:
            null,

        durationMs:
            null,

        metadata,
    };

    trace.events.push(event);

    return event;
}

export function completeTraceEvent(
    trace,
    eventId,
    {
        status = "completed",
        metadata = {},
    } = {}
) {
    if (!trace) {
        throw new Error(
            "Trace is required."
        );
    }

    const event =
        trace.events.find(
            ({ eventId: id }) =>
                id === eventId
        );

    if (!event) {
        throw new Error(
            `Trace event "${eventId}" not found.`
        );
    }

    const completedAt =
        new Date();

    event.status =
        status;

    event.completedAt =
        completedAt;

    event.durationMs =
        completedAt.getTime() -
        event.startedAt.getTime();

    event.metadata = {
        ...event.metadata,
        ...metadata,
    };

    return event;
}

export function recordTraceError(
    trace,
    {
        type = "agent",
        name = "agent.error",
        error,
        metadata = {},
    }
) {
    if (!trace) {
        throw new Error(
            "Trace is required."
        );
    }

    if (!error) {
        throw new Error(
            "Error is required."
        );
    }

    const event = {
        eventId:
            crypto.randomUUID(),

        type,

        name,

        status: "failed",

        startedAt:
            new Date(),

        completedAt:
            new Date(),

        durationMs:
            0,

        metadata: {
            ...metadata,

            error: {
                name:
                    error.name,

                message:
                    error.message,
            },
        },
    };

    trace.events.push(event);

    return event;
}