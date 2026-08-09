export function serializePrompt(state) {
    const {
        system,
        memory,
        context,
        tools,
        user,
    } = state.prompt;

    const toolSection =
        tools?.length
            ? tools
                .map(
                    ({ tool, data }) =>
                        `Tool: ${tool}\n\n${JSON.stringify(
                            data,
                            null,
                            2
                        )}`
                )
                .join(
                    "\n\n------------------------------\n\n"
                )
            : "No tool outputs available.";

    state.serializedPrompt = `
SYSTEM
${system}

==============================

CONVERSATION HISTORY
${memory || "No previous conversation."}

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