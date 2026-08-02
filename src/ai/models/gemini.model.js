import ai from "../../config/gemini.js";

export async function generateGeminiResponse(
  prompt
) {
  const response =
    await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
    });

  return response.text;
}