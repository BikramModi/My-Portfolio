import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPDF(buffer) {
  try {
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    let text = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      text += pageText + "\n";
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      text,
      pageCount: pdf.numPages,
      info: {},
      metadata: null,
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF: ${error.message}`, {
      cause: error,
    });
  }
}