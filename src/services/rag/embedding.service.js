import DocumentChunk from "../../models/document-chunk.model.js";
import DocumentEmbedding from "../../models/document-embedding.model.js";

import {
  generateEmbeddings,
} from "../../providers/embedding.provider.js";

/**
 * Generate embeddings for all chunks
 * belonging to a document.
 */
export async function createDocumentEmbeddings(
  documentId
) {
  /**
   * Load chunks
   */
  const chunks = await DocumentChunk.find({
    document: documentId,
  }).sort({
    chunkIndex: 1,
  });

  if (chunks.length === 0) {
    return [];
  }

  /**
   * Generate embeddings
   */
  const embeddings =
    await generateEmbeddings(
      chunks.map(
        (chunk) => chunk.content
      )
    );

  /**
   * Remove previous embeddings.
   * Makes re-processing safe.
   */
  await DocumentEmbedding.deleteMany({
    document: documentId,
  });

  /**
   * Build Mongo documents
   */
  const documents = chunks.map(
    (chunk, index) => ({
      document: documentId,

      documentChunk: chunk._id,

      provider:
        embeddings[index].provider,

      model: embeddings[index].model,

      dimensions:
        embeddings[index]
          .dimensions,

      embedding:
        embeddings[index]
          .embedding,
    })
  );

  return await DocumentEmbedding.insertMany(
    documents,
    {
      ordered: true,
    }
  );
}