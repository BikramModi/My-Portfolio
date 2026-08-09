import crypto from "node:crypto";

export function generateConversationId() {
    return crypto.randomUUID();
}