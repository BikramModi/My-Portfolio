import { searchRelevantChunks } from "./search.service.js";

import { buildRAGPrompt } from "./rag.prompt.js";

import { generateAIResponse } from "../../ai/models/index.model.js";

export async function generateRAGResponse(
  question
) {
  const chunks =
    await searchRelevantChunks(
      question,
      5
    );

  const context = chunks
    .map(
      (chunk, index) =>
        `Chunk ${index + 1}:\n${chunk.content}`
    )
    .join("\n\n-----------------\n\n");

  const prompt = buildRAGPrompt({
    context,
    question,
  });

  const answer =
    await generateAIResponse(prompt);

  return {
    answer,

    sources: chunks.map(
      (chunk) => ({
        chunkId: chunk._id,
        chunkIndex:
          chunk.chunkIndex,
        document:
          chunk.document,
      })
    ),
  };
}