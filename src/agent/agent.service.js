import { routeTool }
  from "./tool-router.js";

export async function runAgent(message) {

  const result =
    await routeTool(message);

  return {
    toolExecuted: true,
    result
  };
}