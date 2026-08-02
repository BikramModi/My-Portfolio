import DocumentChunk from "../../models/document-chunk.model.js";
import DocumentEmbedding from "../../models/document-embedding.model.js";

import {
  generateEmbedding,
} from "../../providers/embedding.provider.js";

/**
 * Cosine similarity
 */
function cosineSimilarity(a, b) {
  let dot = 0;

  let normA = 0;

  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];

    normA += a[i] * a[i];

    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search similar chunks.
 */
export async function searchRelevantChunks(
  question,
  limit = 5
) {
  /**
   * Create embedding
   * for the question.
   */
  const questionEmbedding =
    await generateEmbedding(question);

  /**
   * Load all embeddings.
   */
  const embeddings =
    await DocumentEmbedding.find()
      .populate("documentChunk");

  /**
   * Calculate similarity.
   */
  const ranked = embeddings.map(
    (embedding) => ({
      chunk:
        embedding.documentChunk,

      similarity:
        cosineSimilarity(
          questionEmbedding.embedding,
          embedding.embedding
        ),
    })
  );

  /**
   * Highest score first.
   */
  ranked.sort(
    (a, b) =>
      b.similarity - a.similarity
  );

  return ranked
    .slice(0, limit)
    .map((item) => item.chunk);
}