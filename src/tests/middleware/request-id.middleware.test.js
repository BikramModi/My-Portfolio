import {
    describe,
    it,
    expect,
    jest,
} from "@jest/globals";

import {
    requestIdMiddleware,
} from "../../../src/middlerwares/request-id.middleware.js";

describe(
    "Request ID Middleware",
    () => {

        it(
            "should generate a request ID",
            () => {
                const req = {
                    get: jest.fn()
                        .mockReturnValue(
                            undefined
                        ),
                };

                const res = {
                    setHeader:
                        jest.fn(),
                };

                const next =
                    jest.fn();

                requestIdMiddleware(
                    req,
                    res,
                    next
                );

                expect(
                    req.requestId
                ).toBeDefined();

                expect(
                    typeof req.requestId
                ).toBe("string");

                expect(
                    res.setHeader
                ).toHaveBeenCalledWith(
                    "X-Request-ID",
                    req.requestId
                );

                expect(
                    next
                ).toHaveBeenCalledTimes(1);
            }
        );

        it(
            "should preserve an existing request ID",
            () => {
                const req = {
                    get: jest.fn()
                        .mockReturnValue(
                            "client-request-123"
                        ),
                };

                const res = {
                    setHeader:
                        jest.fn(),
                };

                const next =
                    jest.fn();

                requestIdMiddleware(
                    req,
                    res,
                    next
                );

                expect(
                    req.requestId
                ).toBe(
                    "client-request-123"
                );

                expect(
                    res.setHeader
                ).toHaveBeenCalledWith(
                    "X-Request-ID",
                    "client-request-123"
                );

                expect(
                    next
                ).toHaveBeenCalledTimes(1);
            }
        );

    }
);