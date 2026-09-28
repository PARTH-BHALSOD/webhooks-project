import rateLimit from "express-rate-limit";

const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 min 30 req
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many webhook requests",
  },
});

export default webhookRateLimit;
