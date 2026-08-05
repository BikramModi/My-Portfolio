import {
    retrieveRelevantDocuments
}
from "./retrieval.service.js";

import {
    buildRAGPrompt
}
from "./rag.prompt.js";

import {
    generateAIResponse
}
from "../../ai/models/index.model.js";

export async function generateRAGResponse(
    question
){

    const retrieval =
        await retrieveRelevantDocuments({

            query: question,

        });

    const prompt =
        buildRAGPrompt({

            context:
                retrieval.retrievedContext,

            question,

        });

    const answer =
        await generateAIResponse(
            prompt
        );

    return {

        answer,

        sources:
            retrieval.sources,

    };

}