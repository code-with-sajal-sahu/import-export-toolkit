import rateLimit from "express-rate-limit";

// 🔴 Strict: Import Excel
export const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                 // 10 imports per window
  message: {
    message: "Too many import attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🟠 Moderate: Export users
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: "Too many export requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🟢 Light: General read APIs
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
