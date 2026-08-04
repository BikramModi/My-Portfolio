import { searchRelevantChunks }
    from "./search.service.js";

export async function retrieveRelevantDocuments({
    query,
    topK = 5,
}) {

    const chunks =
        await searchRelevantChunks(
            query,
            topK
        );

    const context =
        chunks
            .map(
                (chunk, index) =>
                    `Chunk ${index + 1}:\n${chunk.content}`
            )
            .join(
                "\n\n-----------------\n\n"
            );

    return {

        retrievedContext: context,
        documents: chunks,
        sources:
            chunks.map(chunk => ({

                chunkId:
                    chunk._id,

                chunkIndex:
                    chunk.chunkIndex,

                document:
                    chunk.document,

            })),

        metadata: {
            totalChunks: chunks.length,
            topK,
        },

    };

}