import { Schema, model } from "mongoose";

const DocumentSchema = new Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true,
        },

        filename: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        size: {
            type: Number,
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        cloudinaryId: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "UPLOADED",
                "PROCESSING",
                "READY",
                "FAILED",
            ],
            default: "UPLOADED",
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, // This field is optional, as the document may not be associated with a user
        },

        processingStartedAt: Date,

        processingCompletedAt: Date,

        processingError: String,
    },
    {
        timestamps: true,
    }
);

export default model(
    "Document",
    DocumentSchema
);