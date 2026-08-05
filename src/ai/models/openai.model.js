import { openai } from "../../config/openai.js";

export async function generateOpenAIResponse(prompt) {

    const response =
        await openai.responses.create({

            model: process.env.OPENAI_MODEL,

            input: prompt,

        });

    return response.output_text;
}