import { ragTool }
  from "../tools/rag.tool.js";

import { calculatorTool }
  from "../tools/calculator.tool.js";

import { portfolioTool }
  from "../tools/portfolio.tool.js";

export async function routeTool(message) {

  const text = message.toLowerCase();

  if (
    text.includes("calculate") ||
    /[\d+\-*/()]/.test(text)
  ) {
    return await calculatorTool(
      text.replace("calculate", "")
    );
  }

  if (
    text.includes("portfolio") ||
    text.includes("skills")
  ) {
    return await portfolioTool();
  }

  return await ragTool(message);
}