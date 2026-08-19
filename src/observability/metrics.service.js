const counters = new Map();

const durations = new Map();

function incrementCounter(
    name,
    value = 1
) {
    const current =
        counters.get(name) ?? 0;

    counters.set(
        name,
        current + value
    );

    return counters.get(name);
}

function recordDuration(
    name,
    durationMs
) {
    const values =
        durations.get(name) ?? [];

    values.push(durationMs);

    durations.set(
        name,
        values
    );

    return durationMs;
}

export function incrementMetric(
    name,
    value = 1
) {
    return incrementCounter(
        name,
        value
    );
}

export function recordMetricDuration(
    name,
    durationMs
) {
    if (
        typeof durationMs !==
        "number"
    ) {
        throw new TypeError(
            "durationMs must be a number."
        );
    }

    if (
        durationMs < 0
    ) {
        throw new RangeError(
            "durationMs cannot be negative."
        );
    }

    return recordDuration(
        name,
        durationMs
    );
}

export function getMetricSnapshot() {
    const metricDurations =
        {};

    for (
        const [
            name,
            values,
        ] of durations.entries()
    ) {
        const count =
            values.length;

        const total =
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            );

        metricDurations[name] = {
            count,

            totalMs:
                total,

            averageMs:
                count
                    ? total / count
                    : 0,

            minMs:
                count
                    ? Math.min(
                        ...values
                    )
                    : 0,

            maxMs:
                count
                    ? Math.max(
                        ...values
                    )
                    : 0,
        };
    }

    return {
        counters:
            Object.fromEntries(
                counters
            ),

        durations:
            metricDurations,
    };
}

export function resetMetrics() {
    counters.clear();

    durations.clear();
}