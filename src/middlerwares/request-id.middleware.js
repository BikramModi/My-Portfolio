import crypto from "crypto";

export function requestIdMiddleware(
    req,
    res,
    next
) {
    const incomingRequestId =
        req.get("X-Request-ID");

    const requestId =
        incomingRequestId ||
        crypto.randomUUID();

    req.requestId =
        requestId;

    res.setHeader(
        "X-Request-ID",
        requestId
    );

    next();
}