import { Schema, model } from "mongoose";

const DocumentEmbeddingSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    documentChunk: {
      type: Schema.Types.ObjectId,
      ref: "DocumentChunk",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: [
        "openai",
        "gemini",
        "ollama",
      ],
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    dimensions: {
      type: Number,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * One embedding per provider/model
 * for each chunk.
 */
DocumentEmbeddingSchema.index(
  {
    documentChunk: 1,
    provider: 1,
    model: 1,
  },
  {
    unique: true,
  }
);

const DocumentEmbedding = model(
  "DocumentEmbedding",
  DocumentEmbeddingSchema
);

export default DocumentEmbedding;