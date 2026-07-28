import jwt from "jsonwebtoken";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/refresh",
  "/auth/logout",
  "/ai/health",
  "/ai/models",
  "/ai/chat",
];

export const authMiddleware = async (req, res, next) => {
  // Allow public routes
  if (publicRoutes.some((route) => req.originalUrl.startsWith(route))) {
    return next();
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // No access token
  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    // Attach user data
    req.user = decoded;

    next();
  } catch (err) {
    // Access token expired
    if (err.name === "TokenExpiredError") {
      // No refresh token
      if (!refreshToken) {
        return res.status(401).json({
          message: "Access token expired, refresh token missing",
        });
      }

      try {
        // Verify refresh token
        jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        // Frontend should call refresh endpoint
        return res.status(403).json({
          message: "Access token expired, refresh available",
        });
      } catch (_refreshErr) {
        return res.status(401).json({
          message: "Refresh token invalid or expired",
        });
      }
    }

    // Invalid token
    return res.status(401).json({ message: "Invalid access token" });
  }
};
