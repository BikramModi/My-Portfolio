import {
    MEMORY_LIMITS,
} from "./memory-limit.config.js";

export function limitConversationMemory(
    messages = [],
    {
        maxMessages =
            MEMORY_LIMITS.maxMessages,

        maxCharacters =
            MEMORY_LIMITS.maxCharacters,
    } = {}
) {
    if (!messages.length) {
        return [];
    }

    const recentMessages =
        messages.slice(-maxMessages);

    const selected = [];

    let characterCount = 0;

    for (
        let index =
            recentMessages.length - 1;
        index >= 0;
        index--
    ) {
        const message =
            recentMessages[index];

        const messageSize =
            message.content?.length ?? 0;

        if (
            selected.length > 0 &&
            characterCount +
                messageSize >
                maxCharacters
        ) {
            break;
        }

        selected.unshift(message);

        characterCount +=
            messageSize;
    }

    return selected;
}