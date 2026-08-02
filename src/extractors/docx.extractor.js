import mammoth from "mammoth";

export async function extractDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({
      buffer,
    });

    const text = result.value
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      text,
      pageCount: 0,
      messages: result.messages ?? [],
    };
  } catch (error) {
    throw new Error(
      `Failed to extract DOCX: ${error.message}`,
        { cause: error }
    );
  }
}