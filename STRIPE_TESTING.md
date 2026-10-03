# Stripe Webhook Testing Guide

## Prerequisites
1. Your server should be running on `http://localhost:5001`
2. You need Stripe CLI installed

## Method 1: Stripe CLI (Local Testing) ⭐ RECOMMENDED

### Step 1: Install Stripe CLI
Download from: https://stripe.com/docs/stripe-cli
Or use Chocolatey on Windows:
```bash
choco install stripe-cli
```

### Step 2: Login to Stripe
```bash
stripe login
```
This will open your browser to authenticate.

### Step 3: Start Your Server
```bash
cd "D:/Webhook project/backend"
node server.js
```

### Step 4: Forward Webhooks to Local Server
Open a new terminal and run:
```bash
stripe listen --forward-to http://localhost:5001/webhooks/stripe
```

**IMPORTANT**: The CLI will show you a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy this secret and update your `.env` file:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Then restart your server.

### Step 5: Trigger Test Events
Open another terminal and trigger test events:

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test refund
stripe trigger charge.refunded

# Test invoice payment
stripe trigger invoice.payment_succeeded
```

### Step 6: Check Results
- Watch your server console for logs
- Check Discord for webhook notifications
- Check MongoDB for saved webhook events

---

## Method 2: Ngrok + Stripe Dashboard (Real Webhook Testing)

### Step 1: Start Ngrok
```bash
cd "D:/Webhook project/backend"
./ngrok http 5001
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 2: Configure Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://abc123.ngrok.io/webhooks/stripe`
4. Select events to listen for (or "Select all events")
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Update `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_signing_secret
   ```
8. Restart your server

### Step 3: Test with Real Stripe Events
Create test events from Stripe Dashboard:
1. Go to https://dashboard.stripe.com/test/payments
2. Click "New" to create test payments
3. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. Watch your Discord for notifications!

---

## Method 3: Manual Testing with cURL

If you want to test without Stripe CLI (NOT RECOMMENDED - signature will fail):

```bash
curl -X POST http://localhost:5001/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test-signature" \
  -d '{
    "id": "evt_test_webhook",
    "object": "event",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 2000,
        "currency": "usd",
        "customer": "cus_test_123"
      }
    }
  }'
```

**Note**: This will fail signature verification unless you temporarily disable it.

---

## Verifying Everything Works

### 1. Check Server Console
You should see logs like:
```
Stripe payment_intent.succeeded event saved: 64f8a5...
Worker received job
Processing Stripe event: payment_intent.succeeded
Notification sent successfully: stripe:evt_xxx
```

### 2. Check Discord
You should receive messages like:
```
💳 **Payment Successful**
💰 Amount: 20.00 USD
👤 Customer: cus_test_123
✅ Payment ID: pi_test_123
```

### 3. Check MongoDB
Query your database:
```javascript
// In MongoDB Compass or mongosh
db.webhookevents.find({ source: "stripe" }).sort({ receivedAt: -1 })
db.notifications.find({ channel: "discord" }).sort({ sentAt: -1 })
```

---

## Troubleshooting

### Signature Verification Failed
- Make sure you copied the correct webhook secret
- Restart your server after updating `.env`
- Check that `STRIPE_WEBHOOK_SECRET` in `.env` matches the one from Stripe CLI or Dashboard

### No Discord Messages
- Check `DISCORD_WEBHOOK_URL` in `.env` is correct
- Check Redis is running: `redis-cli ping` should return `PONG`
- Check webhook worker is running
- Check notification status in MongoDB

### Events Not Saved to Database
- Check MongoDB connection
- Check server console for errors
- Verify `MONGO_URI` in `.env` is correct

### Rate Limited
- The endpoint allows 100 requests per minute
- If testing heavily, you might hit the limit temporarily

---

## Quick Start Testing Script

Save this as `test-stripe.sh`:

```bash
#!/bin/bash

echo "Starting Stripe webhook test..."

# Test various events
echo "Testing payment success..."
stripe trigger payment_intent.succeeded

sleep 2

echo "Testing subscription created..."
stripe trigger customer.subscription.created

sleep 2

echo "Testing refund..."
stripe trigger charge.refunded

sleep 2

echo "Testing invoice payment..."
stripe trigger invoice.payment_succeeded

echo "Check your Discord and server logs!"
```

Run with:
```bash
bash test-stripe.sh
```

---

## Event Types Available

Common Stripe events you can test:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.created`
- `customer.updated`
- `customer.deleted`

Full list: https://stripe.com/docs/api/events/types
