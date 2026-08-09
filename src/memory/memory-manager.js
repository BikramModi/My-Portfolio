import {
    limitConversationMemory,
} from "./memory-limiter.service.js";

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

        this.shortTerm =
            shortTerm;

        this.longTerm =
            longTerm;
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

        const messages =
            shortTermMessages.length
                ? shortTermMessages
                : await this.longTerm
                    .getRecentMessages(
                        conversationId,
                        limit
                    );

        return limitConversationMemory(
            messages
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

        const savedMessage =
            await this.longTerm
                .addMessage(
                    conversationId,
                    message,
                    options
                );

        try {
            await this.shortTerm
                .addMessage(
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