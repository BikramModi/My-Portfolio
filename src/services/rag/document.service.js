import streamifier from "streamifier";

import Document from "../../models/document.model.js";

import cloudinary from "../../config/cloudinary.js";

export async function uploadDocument({
  file,

  userId,
}) {
  const result =
    await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "rag-documents",

              resource_type: "raw",
            },

            (error, result) => {
              if (error)
                return reject(error);

              resolve(result);
            }
          );

        streamifier
          .createReadStream(file.buffer)
          .pipe(stream);
      }
    );

  const document =
    await Document.create({
      originalName:
        file.originalname,

      filename:
        result.display_name,

      mimeType:
        file.mimetype,

      size: file.size,

      url: result.secure_url,

      cloudinaryId:
        result.public_id,

      uploadedBy: userId,
    });

  return document;
}