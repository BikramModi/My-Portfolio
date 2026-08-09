import mongoose from "mongoose";

const conversationMessageSchema =
    new mongoose.Schema(
        {
            conversationId: {
                type: String,
                required: true,
                index: true,
                trim: true,
            },

            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false,
                index: true,
            },

            role: {
                type: String,
                enum: [
                    "user",
                    "assistant",
                    "system",
                ],
                required: true,
            },

            content: {
                type: String,
                required: true,
                trim: true,
            },

            sequence: {
                type: Number,
                required: true,
            },

            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
        },
        {
            timestamps: true,
        }
    );

conversationMessageSchema.index({
    conversationId: 1,
    sequence: 1,
});

const ConversationMessage =
    mongoose.model(
        "ConversationMessage",
        conversationMessageSchema
    );

export default ConversationMessage;