import { generateGeminiResponse } from "./gemini.model.js";

export async function generateAIResponse(prompt) {
  switch (process.env.AI_PROVIDER) {
    case "gemini":
      return generateGeminiResponse(prompt);

    case "openai":
      throw new Error("OpenAI not implemented.");

    case "ollama":
      throw new Error("Ollama not implemented.");

    default:
      throw new Error(
        `Unsupported AI provider: ${process.env.AI_PROVIDER}`
      );
  }
}