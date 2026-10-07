import rateLimit from "express-rate-limit";

const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 min 50 req
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many webhook requests",
  },
});

export default webhookRateLimit;
