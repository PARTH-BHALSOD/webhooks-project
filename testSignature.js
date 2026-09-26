const crypto = require("crypto");

const body =
{
  "eventId": "test_027",
  "source": "test",
  "eventType": "test.event",
  "payload": {
    "message": "rate-limit-test-3",
    "value": 300
  }
}
const secret = process.env.WEBHOOK_SECRET;

const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
  .createHmac("sha256", secret)
  .update(`${timestamp}.${body}`)
  .digest("hex");

console.log("Timestamp:", timestamp);
console.log("Signature:", signature);
