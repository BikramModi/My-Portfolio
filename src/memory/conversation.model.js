import mongoose from "mongoose";

const conversationSchema =
    new mongoose.Schema(
        {
            conversationId: {
                type: String,
                required: true,
                unique: true,
                index: true,
                trim: true,
            },

            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false,
                index: true,
            },

            title: {
                type: String,
                trim: true,
                maxlength: 200,
                default: "New Conversation",
            },

            status: {
                type: String,
                enum: [
                    "active",
                    "archived",
                    "deleted",
                ],
                default: "active",
            },

            lastMessageAt: {
                type: Date,
                default: Date.now,
                index: true,
            },
        },
        {
            timestamps: true,
        }
    );

const Conversation =
    mongoose.model(
        "Conversation",
        conversationSchema
    );

export default Conversation;