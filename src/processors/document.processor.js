import axios from "axios"

import Document from "../models/document.model.js";
import DocumentContent from "../models/document-content.model.js";

import { extractPDF } from "../extractors/pdf.extractor.js";
import { extractDOCX } from "../extractors/docx.extractor.js";
import { extractTXT } from "../extractors/txt.extractor.js";

import NotFoundError from "../errors/not-found-error.error.js";

import { createDocumentChunks } from "../services/rag/chunk.service.js";
import { createDocumentEmbeddings } from "../services/rag/embedding.service.js";

export async function processDocument(documentId) {
    const document = await Document.findById(documentId);

    if (!document) {
        throw new NotFoundError("Document not found.");
    }

    document.status = "PROCESSING";
    document.processingStartedAt = new Date();

    await document.save();

    try {
        /**
         * Download original file from Cloudinary
         */
        const response = await axios.get(document.url, {
            responseType: "arraybuffer",
        });

        const buffer = Buffer.from(response.data);

        /**
         * Choose extractor
         */


        const extractors = {
            "application/pdf": extractPDF,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                extractDOCX,
            "text/plain": extractTXT,
        };

        const extractor = extractors[document.mimeType];

        if (!extractor) {
            throw new Error(`Unsupported file type: ${document.mimeType}`);
        }

        const extracted = await extractor(buffer);

        /**
         * Calculate statistics
         */
        const characterCount = extracted.text.length;

        const wordCount = extracted.text
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;

        /**
         * Save extracted content
         */
        const documentContent = await DocumentContent.findOneAndUpdate(
            {
                document: document._id,
            },
            {
                document: document._id,

                text: extracted.text,

                characterCount,

                wordCount,

                pageCount: extracted.pageCount,

                extractor:
                    document.mimeType === "application/pdf"
                        ? "pdf"
                        : document.mimeType ===
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "docx"
                            : "txt",

                extractedAt: new Date(),
            },
            {
                upsert: true,
                new: true,
            }
        );

        /**
        * NEW STEP
        *
        * Split text into chunks.
        */
        await createDocumentChunks(
            documentContent
        );

        /**
         * Create embeddings for the document.
         */

        await createDocumentEmbeddings(document._id);

        /**
         * Update document
         */
        document.status = "READY";

        document.processingCompletedAt = new Date();

        document.processingError = null;

        await document.save();

        return document;
    } catch (error) {
        document.status = "FAILED";

        document.processingCompletedAt = new Date();

        document.processingError = error.message;

        await document.save();

        throw error;
    }
}