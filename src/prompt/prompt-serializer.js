export function serializePrompt(state) {
    const {
        system,
        context,
        tools,
        user,
    } = state.prompt;

    const toolSection =
        tools?.length
            ? tools
                .map(({ tool, data }) =>
                    `Tool: ${tool}
${JSON.stringify(data, null, 2)}`
                )
                .join("\n\n------------------------------\n\n")
            : "No tool outputs available.";

    state.serializedPrompt = `
SYSTEM
${system}

==============================

CONTEXT
${context || "No retrieved context available."}

==============================

TOOLS
${toolSection}

==============================

USER
${user}
`.trim();

    return state;
}