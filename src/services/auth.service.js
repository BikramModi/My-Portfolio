import {
  storePendingRegistration,
  verifyPendingRegistration,
  deletePendingRegistration,
  resendPendingRegistrationOTP,
} from "./otp.service.js";

import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import NotFoundError from "../errors/not-found-error.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";
import ConflictError from "../errors/conflict.error.js";

import { compare } from "bcrypt";
import redisClient from "../config/redis.js";
import { createUser } from "./user.service.js";

export const register = async (userData) => {
  // Check if the email is already registered
  const existingUser = await User.findOne({
    email: userData.email,
  });

  if (existingUser) {
    throw new ConflictError("Email is already registered.");
  }

  // NOTE:
  // If createUser() currently hashes the password,
  // we'll move that hashing here after reviewing user.service.js.

  await storePendingRegistration(userData);

  return {
    message: "Verification code sent to your email.",
  };
};

export const verifyEmail = async ({
  email,
  otp,
}) => {
  const userData =
    await verifyPendingRegistration(
      email,
      otp
    );

  const user = await createUser(userData);

  await deletePendingRegistration(email);

  return {
    message:
      "Email verified successfully.",
    user,
  };
};

export const resendOTP = async ({
  email,
}) => {
  return await resendPendingRegistrationOTP(
    email
  );
};

export const login = async (userData) => {
  const user = await User.findOne({
    email: userData.email,
  });

  if (!user) {
    throw new NotFoundError("This email is not registered.");
  }

  const isPasswordValid = await compare(
    userData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "3h",
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const { password: _password, ...userWithoutPassword } =
    user.toObject();

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};