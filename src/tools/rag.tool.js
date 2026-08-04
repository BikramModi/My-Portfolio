import { generateRAGResponse }
    from "../services/rag/rag.service.js";

export const ragTool = {

    name: "rag",

    async execute(state){

        return await generateRAGResponse(
            state.message
        );

    }

};