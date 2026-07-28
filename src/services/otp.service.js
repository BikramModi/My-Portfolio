import crypto from "crypto";
import bcrypt from "bcrypt";

import redisClient from "../config/redis.js";
import { sendEmail } from "./mail.service.js";

const OTP_EXPIRY_SECONDS = 300;

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

export async function storePendingRegistration(userData) {
  const otp = generateOTP();

  const otpHash = await hashOTP(otp);

  const key = `register:${userData.email}`;

  const value = {
    user: userData,
    otpHash,
  };

  await redisClient.set(
    key,
    JSON.stringify(value),
    {
      EX: OTP_EXPIRY_SECONDS,
    }
  );

  await sendEmail({
    to: userData.email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}`,
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
    category: "Email Verification",
  });

  return true;
}