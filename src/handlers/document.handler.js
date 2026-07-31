

import Router from "express";


import { uploadDocumentValidator } from "../validators/document.validator.js";
import validationMiddleware from "../middlerwares/validation.middleware.js";
import { uploadDocument } from "../services/rag/document.service.js";
import upload from "../middlerwares/upload.middleware.js";


const DOCUMENT_ROUTER = Router();



DOCUMENT_ROUTER.post("/upload",
    validationMiddleware(uploadDocumentValidator),
    upload.single("file"),
  async(
    req,
    res,
    next
) => {
    try {
        const document =
            await uploadDocument({
                file: req.file,

                //userId: req.user.userId, // Assuming you have user authentication and can get the userId from the request object
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

