const rateLimit = require("express-rate-limit");

const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, //1 min 30 req
  limit: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many webhook requests",
  },
});

module.exports = webhookRateLimit;
