import redisClient from "../config/redis.js";

const DEFAULT_MESSAGE_LIMIT = 10;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

function getConversationKey(conversationId) {
    return `ai:conversation:${conversationId}`;
}

export const redisMemoryProvider = {
    async getRecentMessages(
        conversationId,
        limit = DEFAULT_MESSAGE_LIMIT
    ) {
        if (!conversationId) {
            return [];
        }

        const key =
            getConversationKey(conversationId);

        const messages =
            await redisClient.lRange(
                key,
                -limit,
                -1
            );

        return messages.map(
            (message) =>
                JSON.parse(message)
        );
    },

    async addMessage(
        conversationId,
        message
    ) {
        if (!conversationId) {
            throw new Error(
                "Conversation ID is required."
            );
        }

        const key =
            getConversationKey(
                conversationId
            );

        await redisClient.rPush(
            key,
            JSON.stringify(message)
        );

        await redisClient.lTrim(
            key,
            -DEFAULT_MESSAGE_LIMIT,
            -1
        );

        await redisClient.expire(
            key,
            DEFAULT_TTL_SECONDS
        );

        return message;
    },

    async clearConversation(
        conversationId
    ) {
        if (!conversationId) {
            return;
        }

        const key =
            getConversationKey(
                conversationId
            );

        await redisClient.del(key);
    },
};