export class MemoryManager {

    constructor(provider) {

        if (!provider) {
            throw new Error(
                "Memory provider is required."
            );
        }

        this.provider = provider;
    }

    async getRecentMessages(
        conversationId,
        limit = 10
    ) {

        if (!conversationId) {
            return [];
        }

        return this.provider
            .getRecentMessages(
                conversationId,
                limit
            );
    }

    async addMessage(
        conversationId,
        message
    ) {

        if (!conversationId) {
            throw new Error(
                "Conversation ID is required."
            );
        }

        return this.provider.addMessage(
            conversationId,
            message
        );
    }

    async clearConversation(
        conversationId
    ) {

        if (!conversationId) {
            return;
        }

        return this.provider
            .clearConversation(
                conversationId
            );
    }
}