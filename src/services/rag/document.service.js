import crypto from "crypto";
import path from "path";
import streamifier from "streamifier";

import Document from "../../models/document.model.js";
import cloudinary from "../../config/cloudinary.js";

export async function uploadDocument({
  file,
  userId,
}) {
  // Get the original file extension (.pdf, .docx, .txt, etc.)
  const extension = path.extname(file.originalname);

  // Generate a unique filename while preserving the extension
  const publicId = `${crypto.randomUUID()}${extension}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rag-documents",
        resource_type: "auto", // or "raw" for non-image files
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  const document = await Document.create({
    originalName: file.originalname,

    // Stored filename in Cloudinary (e.g. uuid.pdf)
    filename: result.public_id.split("/").pop(),

    mimeType: file.mimetype,

    size: file.size,

    url: result.secure_url,

    // Full Cloudinary public ID (e.g. rag-documents/uuid.pdf)
    cloudinaryId: result.public_id,

    uploadedBy: userId,

    status: "UPLOADED",
  });

  return document;
}