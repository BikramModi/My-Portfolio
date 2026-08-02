import { Schema, model } from "mongoose";

const DocumentChunkSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    documentContent: {
      type: Schema.Types.ObjectId,
      ref: "DocumentContent",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    characterCount: {
      type: Number,
      required: true,
    },

    wordCount: {
      type: Number,
      required: true,
    },

    startOffset: {
      type: Number,
      required: true,
    },

    endOffset: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate chunk indexes
 * for the same document.
 */
DocumentChunkSchema.index(
  {
    document: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  }
);

const DocumentChunk = model(
  "DocumentChunk",
  DocumentChunkSchema
);

export default DocumentChunk;