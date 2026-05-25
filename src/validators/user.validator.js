import { body } from "express-validator";
import User from "../models/user.model.js";

export const createUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("This email has already been taken");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  body("role")
    .optional()
    .isIn(["user", "admin", "moderator"])
    .withMessage("Invalid role"),

  body("status")
    .optional()
    .isIn(["active", "suspended", "deleted"])
    .withMessage("Invalid status"),
];


export const updateUserValidator = [
  body("name").optional(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value,
        _id: { $ne: req.params.id },
      });

      if (user) {
        throw new Error("This email has already been taken");
      }

      return true;
    }),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  body("role")
    .optional()
    .isIn(["user", "admin", "moderator"])
    .withMessage("Invalid role"),

  body("status")
    .optional()
    .isIn(["active", "suspended", "deleted"])
    .withMessage("Invalid status"),
];
