import { body } from "express-validator";
import User from "../models/user.model.js";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("Email already registered");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
];

export const verifyEmailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

export const resendOTPValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
];



export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
];

export const verifyResetOTPValidator = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .isNumeric(),
];


export const resetPasswordValidator = [
  body("resetToken")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required."),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(
          "Passwords do not match."
        );
      }
      return true;
    }),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];
