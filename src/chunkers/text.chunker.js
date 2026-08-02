const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Split extracted document text into overlapping chunks.
 *
 * @param {string} text
 * @param {object} options
 * @returns {Array}
 */
export function chunkText(
  text,
  options = {}
) {
  const chunkSize =
    options.chunkSize ?? DEFAULT_CHUNK_SIZE;

  const overlap =
    options.overlap ?? DEFAULT_CHUNK_OVERLAP;

  if (!text || !text.trim()) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "Chunk overlap must be smaller than chunk size."
    );
  }

  const chunks = [];

  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length
    );

    const content = text
      .slice(start, end)
      .trim();

    if (content.length > 0) {
      chunks.push({
        chunkIndex: index,
        content,
        characterCount: content.length,
        wordCount: content
          .split(/\s+/)
          .filter(Boolean).length,
        startOffset: start,
        endOffset: end,
      });

      index++;
    }

    if (end >= text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}