import { constructEvent } from "../services/stripeService.js";

export const verifyStripeSignature = (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(401).json({
      message: "Missing Stripe signature",
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({
      message: "Server configuration error",
    });
  }

  // Debug logging
  console.log("Verifying Stripe webhook:");
  console.log("- Signature header present:", !!signature);
  console.log("- Raw body type:", typeof req.rawBody);
  console.log("- Raw body is Buffer:", Buffer.isBuffer(req.rawBody));
  console.log("- Raw body length:", req.rawBody?.length);
  console.log("- Webhook secret configured:", !!process.env.STRIPE_WEBHOOK_SECRET);

  const result = constructEvent(
    req.rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!result.success) {
    console.error("Stripe signature verification failed:", result.error);
    return res.status(401).json({
      message: "Invalid Stripe signature",
    });
  }

  req.stripeEvent = result.event;
  next();
};

export default verifyStripeSignature;
