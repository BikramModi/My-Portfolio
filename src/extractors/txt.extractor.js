export async function extractTXT(buffer) {
  try {
    const text = buffer
      .toString("utf8")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      text,
      pageCount: 1,
      info: {},
      metadata: null,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract TXT: ${error.message}`,
        { cause: error }
    );
  }
}