import crypto from "crypto";
import bcrypt from "bcrypt";

import redisClient from "../config/redis.js";

import { sendEmail } from "./mail.service.js";

import NotFoundError from "../errors/not-found-error.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";
import ConflictError from "../errors/conflict.error.js";

const OTP_EXPIRY_SECONDS = 300;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;
const MAX_OTP_ATTEMPTS = 5;

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

async function sendVerificationEmail(email, name, otp) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}`,
    html: `
      <h2>Email Verification</h2>

      <p>Hello ${name},</p>

      <p>Your verification code is:</p>

      <h1 style="letter-spacing:6px;">${otp}</h1>

      <p>This code expires in 5 minutes.</p>
    `,
    category: "Email Verification",
  });
}

export async function storePendingRegistration(userData) {
  const key = `register:${userData.email}`;

  const existing = await redisClient.get(key);

  if (existing) {
    throw new ConflictError(
      "A verification code has already been sent."
    );
  }

  const otp = generateOTP();

  const otpHash = await hashOTP(otp);

  const value = {
    user: userData,
    otpHash,
    resendCount: 0,
    lastSentAt: Date.now(),
  };

  await redisClient.set(
    key,
    JSON.stringify(value),
    {
      EX: OTP_EXPIRY_SECONDS,
    }
  );

  await sendVerificationEmail(
    userData.email,
    userData.name,
    otp
  );

  return true;
}

export async function verifyPendingRegistration(
  email,
  otp
) {
  const key = `register:${email}`;

  const pending = await redisClient.get(key);

  if (!pending) {
    throw new NotFoundError(
      "Verification code expired."
    );
  }

  const data = JSON.parse(pending);

  const isValid = await bcrypt.compare(
    otp,
    data.otpHash
  );

  if (!isValid) {
    throw new UnauthorizedError(
      "Invalid verification code."
    );
  }

  return data.user;
}

export async function deletePendingRegistration(email) {
  await redisClient.del(`register:${email}`);
}

export async function resendPendingRegistrationOTP(
  email
) {
  const key = `register:${email}`;

  const pending = await redisClient.get(key);

  if (!pending) {
    throw new NotFoundError(
      "Registration expired. Please register again."
    );
  }

  const data = JSON.parse(pending);

  if (data.resendCount >= MAX_RESEND_ATTEMPTS) {
    throw new ConflictError(
      "Maximum resend attempts exceeded."
    );
  }

  const secondsSinceLastEmail =
    (Date.now() - data.lastSentAt) / 1000;

  if (
    secondsSinceLastEmail <
    RESEND_COOLDOWN_SECONDS
  ) {
    throw new ConflictError(
      `Please wait ${
        RESEND_COOLDOWN_SECONDS -
        Math.floor(secondsSinceLastEmail)
      } seconds before requesting another code.`
    );
  }

  const otp = generateOTP();

  data.otpHash = await hashOTP(otp);

  data.resendCount += 1;

  data.lastSentAt = Date.now();

  await redisClient.set(
    key,
    JSON.stringify(data),
    {
      EX: OTP_EXPIRY_SECONDS,
    }
  );

  await sendVerificationEmail(
    data.user.email,
    data.user.name,
    otp
  );

  return {
    message: "Verification code resent successfully.",
  };
}

export async function storePasswordResetOTP(user) {
  const key = `reset:${user.email}`;

  const existing = await redisClient.get(key);

  if (existing) {
    throw new ConflictError(
      "A password reset code has already been sent."
    );
  }

  const otp = generateOTP();

  const otpHash = await hashOTP(otp);

  const value = {
  userId: user._id.toString(),
  email: user.email,
  otpHash,
  resendCount: 0,
  attempts: 0,
  lastSentAt: Date.now(),
};

  await redisClient.set(
    key,
    JSON.stringify(value),
    {
      EX: OTP_EXPIRY_SECONDS,
    }
  );

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    text: `Your password reset code is ${otp}`,
    html: `
      <h2>Password Reset</h2>

      <p>Hello ${user.name},</p>

      <p>Your password reset code is:</p>

      <h1 style="letter-spacing:6px;">${otp}</h1>

      <p>This code expires in 5 minutes.</p>
    `,
    category: "Password Reset",
  });

  return true;
}

export async function verifyPasswordResetOTP(
  email,
  otp
) {
  const key = `reset:${email}`;

  const pending = await redisClient.get(key);

  if (!pending) {
    throw new NotFoundError(
      "Verification code expired or reset request not found."
    );
  }

  const data = JSON.parse(pending);

  const isValid = await bcrypt.compare(
    otp,
    data.otpHash
  );

  if (!isValid) {
    data.attempts += 1;

    // Too many failed attempts
    if (data.attempts >= MAX_OTP_ATTEMPTS) {
      await redisClient.del(key);

      throw new UnauthorizedError(
        "Maximum verification attempts exceeded. Please request a new password reset code."
      );
    }

    // Save updated attempts while preserving the remaining TTL
    const ttl = await redisClient.ttl(key);

    await redisClient.set(
      key,
      JSON.stringify(data),
      {
        EX: ttl,
      }
    );

    throw new UnauthorizedError(
      `Invalid verification code. ${
        MAX_OTP_ATTEMPTS - data.attempts
      } attempt(s) remaining.`
    );
  }

  // OTP is correct

  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  await redisClient.set(
    `reset-token:${resetToken}`,
    JSON.stringify({
      userId: data.userId,
      email: data.email,
    }),
    {
      EX: OTP_EXPIRY_SECONDS,
    }
  );

  // OTP cannot be reused
  await redisClient.del(key);

  return resetToken;
}

export async function verifyResetToken(
  resetToken
) {
  const key = `reset-token:${resetToken}`;

  const data = await redisClient.get(key);

  if (!data) {
    throw new NotFoundError(
      "Reset token expired."
    );
  }

  return JSON.parse(data);
}

export async function deleteResetToken(
  resetToken
) {
  await redisClient.del(
    `reset-token:${resetToken}`
  );
}