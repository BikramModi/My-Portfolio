export function buildChatPrompt(message) {
  return `
You are an experienced software engineer.

Answer clearly.

If you don't know something, say you don't know.

Question:

${message}
`;
}