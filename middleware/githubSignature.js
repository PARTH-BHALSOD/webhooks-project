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

  if (!req.rawBody) {
    return res.status(400).json({ message: "Missing request body" });
  }

  const hmac = crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  const expectedSignature = `sha256=${hmac}`;

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  // timingSafeEqual throws if lengths differ, so check length first
  const isValid =
    sigBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(sigBuf, expectedBuf);

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid GitHub signature",
    });
  }

  next();
};

export default verifyGithubSignature;
