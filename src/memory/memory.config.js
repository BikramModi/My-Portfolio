import {
    MemoryManager,
} from "./memory-manager.js";

import {
    redisMemoryProvider,
} from "./redis-memory.service.js";

import {
    createMemoryProvider,
} from "./memory.interface.js";

const provider =
    createMemoryProvider(
        redisMemoryProvider
    );

export const memoryManager =
    new MemoryManager(provider);