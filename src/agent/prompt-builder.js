export function buildPrompt(state) {

    const system = `
You are Bikram Modi's AI portfolio assistant.

Always answer accurately.

Use tool results whenever available.

Never invent portfolio information.

If information is unavailable, say so.
`;

const toolContext =
state.toolResult
    .map(item =>
        JSON.stringify(item.result))
    .join("\n");

const documents =
state.toolResult
    .find(x=>x.tool==="rag")
    ?.result
    ?.documents;

    return {
        system,
        context: toolContext,
        user: state.message,
    };

}