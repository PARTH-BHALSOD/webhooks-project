/**
 * Test Script for Stripe Webhook Handler
 *
 * This script generates properly signed Stripe webhook payloads
 * and sends them to your local webhook endpoint for testing.
 *
 * Usage: node test-stripe-webhook.js [event-type]
 *
 * Available event types:
 * - payment_intent.succeeded (default)
 * - payment_intent.payment_failed
 * - charge.refunded
 * - customer.subscription.created
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = process.env.PORT || 5001;
const WEBHOOK_URL = `http://localhost:${PORT}/api/webhooks/stripe`;

if (!WEBHOOK_SECRET) {
  console.error("❌ FATAL ERROR: WEBHOOK_SECRET is missing in .env");
  process.exit(1);
}

// Get event type from command line argument or use default
const eventType = process.argv[2] || "payment_intent.succeeded";

// Sample Stripe webhook payloads for different event types
const samplePayloads = {
  "payment_intent.succeeded": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_3Abc123DefGhi",
        object: "payment_intent",
        amount: 5000, // $50.00
        currency: "usd",
        status: "succeeded",
        customer: "cus_ABC123xyz",
        metadata: {
          productType: "course",
          courseId: "javascript-101",
          customerEmail: "john@example.com",
          orderId: "order_12345"
        }
      }
    }
  },

  "payment_intent.payment_failed": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "payment_intent.payment_failed",
    data: {
      object: {
        id: "pi_3Abc123Failed",
        object: "payment_intent",
        amount: 2500, // $25.00
        currency: "usd",
        status: "requires_payment_method",
        customer: "cus_XYZ789abc",
        last_payment_error: {
          message: "Your card was declined.",
          code: "card_declined"
        },
        metadata: {
          productType: "subscription",
          planId: "pro-monthly",
          customerEmail: "jane@example.com"
        }
      }
    }
  },

  "charge.succeeded": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "charge.succeeded",
    data: {
      object: {
        id: "ch_3Abc123Success",
        object: "charge",
        amount: 7500, // $75.00
        currency: "usd",
        status: "succeeded",
        customer: "cus_TEST123"
      }
    }
  },

  "charge.refunded": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_3Abc123Refund",
        object: "charge",
        amount: 5000, // Original amount $50.00
        amount_refunded: 5000, // Full refund
        currency: "usd",
        refunded: true,
        customer: "cus_REFUND789"
      }
    }
  },

  "customer.subscription.created": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_ABC123xyz",
        object: "subscription",
        customer: "cus_SUB123",
        status: "active",
        items: {
          data: [
            {
              price: {
                id: "price_pro_monthly",
                product: "prod_premium_plan",
                recurring: {
                  interval: "month"
                }
              }
            }
          ]
        }
      }
    }
  },

  "customer.subscription.updated": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_ABC123xyz",
        object: "subscription",
        customer: "cus_SUB123",
        status: "active",
        items: {
          data: [
            {
              price: {
                id: "price_enterprise_monthly",
                product: "prod_enterprise_plan"
              }
            }
          ]
        }
      }
    }
  },

  "customer.subscription.deleted": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_CANCELED123",
        object: "subscription",
        customer: "cus_CANCELED456",
        status: "canceled",
        canceled_at: Math.floor(Date.now() / 1000)
      }
    }
  },

  "invoice.payment_succeeded": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "invoice.payment_succeeded",
    data: {
      object: {
        id: "in_ABC123paid",
        object: "invoice",
        amount_paid: 4900, // $49.00
        currency: "usd",
        customer: "cus_INVOICE123",
        subscription: "sub_ABC123xyz",
        status: "paid"
      }
    }
  },

  "invoice.payment_failed": {
    id: "evt_test_webhook_" + Date.now(),
    object: "event",
    type: "invoice.payment_failed",
    data: {
      object: {
        id: "in_XYZ789failed",
        object: "invoice",
        amount_due: 4900, // $49.00
        currency: "usd",
        customer: "cus_FAILED789",
        subscription: "sub_XYZ789",
        status: "open",
        attempt_count: 2
      }
    }
  }
};

// Check if event type is valid
if (!samplePayloads[eventType]) {
  console.error(`❌ Unknown event type: ${eventType}`);
  console.log("\n📋 Available event types:");
  Object.keys(samplePayloads).forEach(type => {
    console.log(`   - ${type}`);
  });
  process.exit(1);
}

// Get the payload for the requested event type
const payload = samplePayloads[eventType];

// Create the webhook event body in the format your system expects
const webhookBody = {
  eventId: payload.id,
  source: "stripe",
  eventType: payload.type,
  payload: payload
};

// Generate timestamp
const timestamp = Math.floor(Date.now() / 1000);

// Convert body to string (this is what will be sent over HTTP)
const rawBodyString = JSON.stringify(webhookBody);

// Generate HMAC-SHA256 signature
const signature = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(`${timestamp}.${rawBodyString}`)
  .digest("hex");

console.log("\n🎯 ============================================");
console.log("   STRIPE WEBHOOK TEST");
console.log("============================================\n");

console.log("📦 Event Type:", eventType);
console.log("🔗 Target URL:", WEBHOOK_URL);
console.log("\n📄 Payload:");
console.log(JSON.stringify(webhookBody, null, 2));

console.log("\n🔐 Headers:");
console.log("   x-webhook-timestamp:", timestamp);
console.log("   x-webhook-signature:", signature);

console.log("\n📋 Instructions for testing:");
console.log("─────────────────────────────────────────────\n");

console.log("Option 1: Use this with Postman/Insomnia");
console.log("─────────────────────────────────────────────");
console.log("1. Set method to POST");
console.log("2. URL:", WEBHOOK_URL);
console.log("3. Headers:");
console.log("   Content-Type: application/json");
console.log("   x-webhook-timestamp:", timestamp);
console.log("   x-webhook-signature:", signature);
console.log("4. Body (raw JSON):");
console.log(rawBodyString);

console.log("\n\nOption 2: Use curl command");
console.log("─────────────────────────────────────────────");
const curlCommand = `curl -X POST ${WEBHOOK_URL} \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-timestamp: ${timestamp}" \\
  -H "x-webhook-signature: ${signature}" \\
  -d '${rawBodyString}'`;

console.log(curlCommand);

console.log("\n\nOption 3: Test different event types");
console.log("─────────────────────────────────────────────");
console.log("Run with different event types:");
console.log("node test-stripe-webhook.js payment_intent.succeeded");
console.log("node test-stripe-webhook.js payment_intent.payment_failed");
console.log("node test-stripe-webhook.js charge.refunded");
console.log("node test-stripe-webhook.js customer.subscription.created");
console.log("node test-stripe-webhook.js invoice.payment_succeeded");
console.log("node test-stripe-webhook.js invoice.payment_failed");

console.log("\n\n💡 Before testing:");
console.log("─────────────────────────────────────────────");
console.log("1. Make sure your server is running:");
console.log("   node server.js");
console.log("\n2. Make sure your worker is running:");
console.log("   node workers/webhookWorker.js");
console.log("\n3. Make sure MongoDB and Redis are running");

console.log("\n✅ Ready to test! Copy one of the commands above.\n");
