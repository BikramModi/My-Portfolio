export class MemoryManager {

    constructor({
        shortTerm,
        longTerm,
    }) {
        if (!shortTerm) {
            throw new Error(
                "Short-term memory provider is required."
            );
        }

        if (!longTerm) {
            throw new Error(
                "Long-term memory provider is required."
            );
        }

        this.shortTerm = shortTerm;
        this.longTerm = longTerm;
    }

    async getRecentMessages(
        conversationId,
        limit = 10
    ) {
        if (!conversationId) {
            return [];
        }

        const shortTermMessages =
            await this.shortTerm
                .getRecentMessages(
                    conversationId,
                    limit
                );

        if (shortTermMessages.length) {
            return shortTermMessages;
        }

        return this.longTerm
            .getRecentMessages(
                conversationId,
                limit
            );
    }

    async addMessage(
        conversationId,
        message,
        options = {}
    ) {
        if (!conversationId) {
            throw new Error(
                "Conversation ID is required."
            );
        }

        /*
         * MongoDB is the durable source
         * of truth.
         */
        const savedMessage =
            await this.longTerm.addMessage(
                conversationId,
                message,
                options
            );

        /*
         * Redis is the short-term
         * acceleration layer.
         */
        try {
            await this.shortTerm.addMessage(
                conversationId,
                message
            );
        } catch (error) {
            console.error(
                "Short-term memory update failed:",
                error
            );
        }

        return savedMessage;
    }

    async clearConversation(
        conversationId
    ) {
        if (!conversationId) {
            return;
        }

        await this.longTerm
            .clearConversation(
                conversationId
            );

        try {
            await this.shortTerm
                .clearConversation(
                    conversationId
                );
        } catch (error) {
            console.error(
                "Failed to clear short-term memory:",
                error
            );
        }
    }
}