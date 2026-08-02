

import Router from "express";


import { uploadDocumentValidator } from "../validators/document.validator.js";
import validationMiddleware from "../middlerwares/validation.middleware.js";
import { uploadDocument } from "../services/rag/document.service.js";
import upload from "../middlerwares/upload.middleware.js";


import { processDocument } from "../processors/document.processor.js";


const DOCUMENT_ROUTER = Router();



DOCUMENT_ROUTER.post(
  "/upload",
  upload.single("file"),
  validationMiddleware(uploadDocumentValidator),
  
  async (req, res, next) => {
    try {
      const document = await uploadDocument({
        file: req.file,

        // userId: req.user.userId
      });

      /**
       * Start processing in background.
       *
       * Don't await.
       */
      processDocument(document._id).catch((error) => {
        console.error(
          "Document processing failed:",
          error
        );
      });

      return res.status(201).json({
        message:
          "Document uploaded successfully.",

        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);





export default DOCUMENT_ROUTER;

