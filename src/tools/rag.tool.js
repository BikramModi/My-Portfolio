import {
    retrieveRelevantDocuments
}
from "../services/rag/retrieval.service.js";

export const ragTool={

    name:"rag",

    description:
        "Retrieve relevant portfolio documents.",

    async execute(state){

        return await retrieveRelevantDocuments({

            query:
                state.message,

            topK:5

        });

    }

};