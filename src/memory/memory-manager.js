export class MemoryManager {

    constructor({
    shortTerm,
    longTerm,
}) {
    console.log("🧠 Short-term provider:", shortTerm);
    console.log("🧠 Long-term provider:", longTerm);

    console.log(
        "shortTerm.addMessage:",
        typeof shortTerm?.addMessage
    );

    console.log(
        "longTerm.addMessage:",
        typeof longTerm?.addMessage
    );

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

        return this.shortTerm
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

        const results =
            await Promise.all([
                this.shortTerm.addMessage(
                    conversationId,
                    message
                ),

                this.longTerm.addMessage(
                    conversationId,
                    message,
                    options
                ),
            ]);

        return results[0];
    }

    async clearConversation(
        conversationId
    ) {
        if (!conversationId) {
            return;
        }

        await Promise.all([
            this.shortTerm
                .clearConversation(
                    conversationId
                ),

            this.longTerm
                .clearConversation(
                    conversationId
                ),
        ]);
    }
}