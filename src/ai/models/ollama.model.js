export async function generateOllamaResponse(prompt) {
    const response = await fetch(
        process.env.OLLAMA_URL + "/api/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                prompt,
                stream: false,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();

        throw new Error(
            `Ollama API Error: ${error}`
        );
    }

    const data = await response.json();

    return data.response;
}