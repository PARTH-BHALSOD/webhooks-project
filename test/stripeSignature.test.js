import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import Stripe from "stripe";
import verifyStripeSignature from "../middleware/stripeWebhookAuth.js";

const SECRET = "whsec_test_secret";

const payload = JSON.stringify({
  id: "evt_test_1",
  object: "event",
  type: "payment_intent.succeeded",
  data: { object: {} },
});

const makeApp = () => {
  const app = express();
  app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
  app.post("/stripe", verifyStripeSignature, (req, res) =>
    res.status(200).json({ id: req.stripeEvent.id })
  );
  return app;
};

const sign = (body) =>
  Stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET });

beforeAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});

describe("Stripe signature middleware", () => {
  it("accepts a correctly signed event", async () => {
    const res = await request(makeApp())
      .post("/stripe")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", sign(payload))
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("evt_test_1");
  });

  it("rejects a missing signature", async () => {
    const res = await request(makeApp())
      .post("/stripe")
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(401);
  });

  it("rejects a tampered body", async () => {
    const tampered = payload.replace("evt_test_1", "evt_hacked");
    const res = await request(makeApp())
      .post("/stripe")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", sign(payload))
      .send(tampered);
    expect(res.status).toBe(401);
  });
});