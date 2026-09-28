import crypto from "crypto";

export const generateSignature = (rawBody, timestamp, secret) => {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
};

export const verifySignature = (rawBody, timestamp, signature, secret) => {
  const expectedSignature = generateSignature(rawBody, timestamp, secret);

  if (
    typeof signature !== "string" ||
    signature.length !== expectedSignature.length
  ) {
    return false;
  }

  // CRITICAL FIX: Explicitly specify 'hex' encoding
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );
};