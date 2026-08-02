import DocumentChunk from "../../models/document-chunk.model.js";

import { chunkText } from "../../chunkers/text.chunker.js";

/**
 * Create chunks for a document.
 *
 * @param {Object} documentContent
 * @returns {Promise<Array>}
 */
export async function createDocumentChunks(
  documentContent
) {
  const chunks = chunkText(
    documentContent.text
  );

  /**
   * Remove existing chunks.
   * Useful when reprocessing documents.
   */
  await DocumentChunk.deleteMany({
    document: documentContent.document,
  });

  const documents = chunks.map((chunk) => ({
    document: documentContent.document,

    documentContent:
      documentContent._id,

    chunkIndex: chunk.chunkIndex,

    content: chunk.content,

    characterCount:
      chunk.characterCount,

    wordCount: chunk.wordCount,

    startOffset: chunk.startOffset,

    endOffset: chunk.endOffset,
  }));

  if (documents.length === 0) {
    return [];
  }

  return await DocumentChunk.insertMany(
    documents,
    {
      ordered: true,
    }
  );
}