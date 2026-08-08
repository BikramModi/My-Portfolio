export function createConversationMessage({
    role,
    content,
}) {
    if (!role) {
        throw new Error(
            "Conversation message role is required."
        );
    }

    if (!content) {
        throw new Error(
            "Conversation message content is required."
        );
    }

    const allowedRoles = [
        "user",
        "assistant",
        "system",
    ];

    if (!allowedRoles.includes(role)) {
        throw new Error(
            `Unsupported conversation message role: ${role}`
        );
    }

    return {
        role,
        content,
        timestamp: new Date(),
    };
}