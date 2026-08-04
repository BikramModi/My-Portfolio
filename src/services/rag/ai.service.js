// import ai from "../../config/gemini.js";
// import { buildChatPrompt } from "./ai.prompt.js";

// export async function generateResponse(message) {
//   const prompt = buildChatPrompt(message);

//   const response = await ai.models.generateContent({
//     model: process.env.GEMINI_MODEL,
//     contents: prompt,
//   });

//   return response.text;
// }


import { buildChatPrompt } from "./ai.prompt.js";
import { generateAIResponse } from "../../ai/models/index.model.js";

export async function generateResponse(message) {
    const prompt = buildChatPrompt(message);

    return generateAIResponse(prompt);
}