import { body } from "express-validator";

export const chatValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({
      max: 4000,
    })
    .withMessage(
      "Message cannot exceed 4000 characters."
    ),
];