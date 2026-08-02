export function buildRAGPrompt({
  context,
  question,
}) {
  return `
You are an AI assistant that answers questions ONLY from the provided context.

Rules:

1. Do NOT invent information.
2. Do NOT use outside knowledge.
3. If the answer is missing from the context, reply exactly:
"I couldn't find that information in the uploaded documents."
4. Keep answers clear and concise.
5. Quote the context only when necessary.

====================

CONTEXT

${context}

====================

QUESTION

${question}

====================

ANSWER
`;
}