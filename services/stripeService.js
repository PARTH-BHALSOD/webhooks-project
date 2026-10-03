import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not configured");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

export const getStripeInstance = () => {
  if (!stripe) {
    throw new Error("Stripe not initialized - check STRIPE_SECRET_KEY");
  }
  return stripe;
};

export const constructEvent = (rawBody, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    return { success: true, event };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default stripe;
