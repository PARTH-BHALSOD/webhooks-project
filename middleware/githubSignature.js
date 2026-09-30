import crypto from "crypto";

export const verifyGithubSignature = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"];

  if (!signature) {
    return res.status(401).json({
      message: "Missing GitHub signature",
    });
  }

  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    console.error("GITHUB_WEBHOOK_SECRET not configured");
    return res.status(500).json({
      message: "Server configuration error",
    });
  }

  // GitHub sends: sha256=<hmac>
  const hmac = crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  const expectedSignature = `sha256=${hmac}`;

  // Timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid GitHub signature",
    });
  }

  next();
};

export default verifyGithubSignature;
