import {
    MemoryManager,
} from "./memory-manager.js";

import {
    redisMemoryProvider,
} from "./redis-memory.service.js";

import {
    mongoMemoryProvider,
} from "./mongo-memory.service.js";

export const memoryManager =
    new MemoryManager({
        shortTerm:
            redisMemoryProvider,

        longTerm:
            mongoMemoryProvider,
    });