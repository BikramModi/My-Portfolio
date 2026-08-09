import Conversation from "./conversation.model.js";
import ConversationMessage from "./conversation-message.model.js";

export const mongoMemoryProvider = {

    async getRecentMessages(
        conversationId,
        limit = 10
    ) {
        if (!conversationId) {
            return [];
        }


        // const count =
            await ConversationMessage.countDocuments({
                conversationId,
            });

        const messages =
            await ConversationMessage
                .find({
                    conversationId,
                })
                .sort({
                    sequence: -1,
                })
                .limit(limit)
                .lean();

       

        return messages
            .reverse()
            .map((message) => ({
                role: message.role,
                content: message.content,
                timestamp:
                    message.createdAt,
            }));
    },

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

        const {
            userId = null,
        } = options;

        let conversation =
            await Conversation.findOne({
                conversationId,
            });

        if (!conversation) {
            // conversation =
                await Conversation.create({
                    conversationId,
                    userId,
                    lastMessageAt:
                        new Date(),
                });
        }

        const lastMessage =
            await ConversationMessage
                .findOne({
                    conversationId,
                })
                .sort({
                    sequence: -1,
                })
                .select("sequence")
                .lean();

        const sequence =
            (lastMessage?.sequence ?? 0) + 1;

        const savedMessage =
            await ConversationMessage.create({
                conversationId,
                userId,
                role: message.role,
                content: message.content,
                sequence,
            });

        await Conversation.updateOne(
            {
                conversationId,
            },
            {
                $set: {
                    lastMessageAt:
                        new Date(),
                },
            }
        );

        return {
            role: savedMessage.role,
            content: savedMessage.content,
            timestamp:
                savedMessage.createdAt,
        };
    },

    async clearConversation(
        conversationId
    ) {
        if (!conversationId) {
            return;
        }

        await ConversationMessage.deleteMany({
            conversationId,
        });

        await Conversation.updateOne(
            {
                conversationId,
            },
            {
                $set: {
                    status: "deleted",
                },
            }
        );
    },
};