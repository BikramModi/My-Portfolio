export function createMemoryProvider(provider) {
    if (!provider) {
        throw new Error(
            "Memory provider is required."
        );
    }

    if (
        typeof provider.getRecentMessages !==
        "function"
    ) {
        throw new Error(
            "Memory provider must implement getRecentMessages()."
        );
    }

    if (
        typeof provider.addMessage !==
        "function"
    ) {
        throw new Error(
            "Memory provider must implement addMessage()."
        );
    }

    return provider;
}