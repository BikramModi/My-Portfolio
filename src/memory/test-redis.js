import redisClient, {
    connectRedis,
} from "../config/redis.js";

import {
    redisMemoryProvider,
} from "./redis-memory.service.js";

await connectRedis();

const conversationId = "test-conversation";

await redisMemoryProvider.addMessage(
    conversationId,
    {
        role: "user",
        content: "Hello",
        timestamp: new Date(),
    }
);

await redisMemoryProvider.addMessage(
    conversationId,
    {
        role: "assistant",
        content: "Hello! How can I help?",
        timestamp: new Date(),
    }
);

const messages =
    await redisMemoryProvider.getRecentMessages(
        conversationId
    );

console.log(messages);

await redisClient.quit();