import Router from "express";
import validationMiddleware from "../middlerwares/validation.middleware.js";
import { register, login } from "../services/auth.service.js";
import { createUserValidator } from "../validators/user.validator.js";
import { loginValidator } from "../validators/auth.validator.js";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const AUTH_ROUTER = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

AUTH_ROUTER.post(
  "/register",
  validationMiddleware(createUserValidator),
  async (req, res, next) => {
    try {
      const { user} = await register(req.body);

     

     return res.status(201).json({
    message: "Registration successful",
    user,
});
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user (sets accessToken & refreshToken cookies)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 */

AUTH_ROUTER.post(
  "/login",
  validationMiddleware(loginValidator),
  async (req, res, next) => {
    try {
      const result = await login(req.body);

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 3,
        domain: ".bikrammodi.com",
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: ".bikrammodi.com",
      });

      return res.status(200).json({
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and revoke refresh session
 *     description: >
 *       Logs out the current user by revoking the refresh token session,
 *       creating an audit log entry, and clearing authentication cookies.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 *       401:
 *         description: Unauthorized - No valid session found
 *       500:
 *         description: Internal server error during logout
 */

AUTH_ROUTER.post("/logout", async (req, res) => {
  try {
    const { refreshToken : _refreshToken } = req.cookies;

    // 4️⃣ Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logged out" });
  } catch (_error) {
    return res.status(500).json({ message: "Logout failed" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the currently logged-in user's information using the access token stored in HTTP-only cookies.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 */

AUTH_ROUTER.get("/me", async (req, res) => {
  try {
    const token = req.cookies.accessToken; // HTTP-only cookie
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    res.json({ user });
  } catch (_err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: >
 *       Verifies the refresh token from HTTP-only cookies,
 *       validates the session, rotates the refresh token,
 *       and issues a new access token.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed
 *       401:
 *         description: Unauthorized - Missing, expired, or invalid refresh token
 */

AUTH_ROUTER.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Create new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Create new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Set new access token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 3, // 3 hours
    });

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({
      message: "Token refreshed",
    });
  } catch (err) {
    console.log(err);

    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
});

export default AUTH_ROUTER;
