export async function calculatorTool(expression) {
  try {
    const result = Function(
      `"use strict"; return (${expression})`
    )();

    return {
      answer: String(result),
    };
  } catch {
    return {
      answer: "Invalid expression",
    };
  }
}