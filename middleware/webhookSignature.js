const { verifySignature } = require("../services/webhookSignature");

const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];

  if (!signature || !timestamp) {
    return res.status(401).json({
      message: "Missing webhook signature or timestamp",
    });
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return res.status(401).json({
      message: "Invalid webhook timestamp",
    });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const difference = Math.abs(currentTime - timestampNumber);

  if (difference > 300) {
    return res.status(401).json({
      message: "Webhook timestamp expired",
    });
  }

  const isValid = verifySignature(
    req.rawBody,
    timestamp,
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }

  next();
};

module.exports = verifyWebhookSignature;
