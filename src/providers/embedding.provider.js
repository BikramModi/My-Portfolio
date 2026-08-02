import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const PROVIDER =
  process.env.EMBEDDING_PROVIDER || "gemini";

const MODEL =
  process.env.EMBEDDING_MODEL ||
  "gemini-embedding-001";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate embedding for a single text.
 */
export async function generateEmbedding(text) {
  switch (PROVIDER) {
    case "openai":
      return generateOpenAIEmbedding(text);

    case "gemini":
      return generateGeminiEmbedding(text);

    case "ollama":
      throw new Error(
        "Ollama provider is not implemented."
      );

    default:
      throw new Error(
        `Unsupported embedding provider: ${PROVIDER}`
      );
  }
}


/**
 * Process items in batches.
 */

async function processInBatches(items, batchSize, processor) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(processor)
    );

    results.push(...batchResults);
  }

  return results;
}



/**
 * Generate embeddings for multiple texts in batches.
 */

const BATCH_SIZE = 10;

export async function generateEmbeddings(texts) {
  return processInBatches(
    texts,
    BATCH_SIZE,
    generateEmbedding
  );
}

/**
 * OpenAI implementation.
 */
async function generateOpenAIEmbedding(text) {
  const response =
    await openai.embeddings.create({
      model: MODEL,
      input: text,
    });

  return {
    provider: "openai",
    model: MODEL,
    dimensions:
      response.data[0].embedding.length,
    embedding:
      response.data[0].embedding,
  };
}

/**
 * Gemini implementation.
 */
async function generateGeminiEmbedding(text) {
  const response =
    await gemini.models.embedContent({
      model: MODEL,
      contents: text,
    });

  const embedding =
    response.embeddings[0].values;

  return {
    provider: "gemini",
    model: MODEL,
    dimensions: embedding.length,
    embedding,
  };
}