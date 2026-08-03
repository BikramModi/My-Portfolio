import { generateRAGResponse }
  from "../services/rag/rag.service.js";

export async function ragTool(query) {
  return await generateRAGResponse(query);
}