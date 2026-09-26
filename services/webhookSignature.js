const crypto = require("crypto");

const generateSignature = (rawBody, timestamp, secret) => {
    return crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");
};

const verifySignature = (rawBody, timestamp, signature, secret) => {
    const expectedSignature = generateSignature(
        rawBody,
        timestamp,
        secret
    );

    if (
        typeof signature !== "string" ||
        signature.length !== expectedSignature.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
};

module.exports = {
    generateSignature,
    verifySignature
};