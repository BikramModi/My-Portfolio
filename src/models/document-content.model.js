import { Schema, model } from "mongoose";

const DocumentContentSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      unique: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
    },

    characterCount: {
      type: Number,
      default: 0,
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    pageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentContent = model(
  "DocumentContent",
  DocumentContentSchema
);

export default DocumentContent;