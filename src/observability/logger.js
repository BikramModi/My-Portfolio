function writeLog(
    level,
    message,
    metadata = {}
) {
    const entry = {
        timestamp:
            new Date().toISOString(),

        level,

        message,

        ...metadata,
    };

    const serialized =
        JSON.stringify(entry);

    switch (level) {
        case "error":
            console.error(serialized);
            break;

        case "warn":
            console.warn(serialized);
            break;

        default:
            console.log(serialized);
    }

    return entry;
}

export function logInfo(
    message,
    metadata = {}
) {
    return writeLog(
        "info",
        message,
        metadata
    );
}

export function logWarn(
    message,
    metadata = {}
) {
    return writeLog(
        "warn",
        message,
        metadata
    );
}

export function logError(
    message,
    metadata = {}
) {
    return writeLog(
        "error",
        message,
        metadata
    );
}