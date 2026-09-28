import crypto from "crypto";

const body = {
  eventId: "github_limit_102",
  source: "github",
  eventType: "push",
  payload: { branch: "main", commits: 1 },
};
const secret = process.env.WEBHOOK_SECRET;

if (!secret) {
  console.error("FATAL ERROR: WEBHOOK_SECRET is missing.");
  process.exit(1);
}

const timestamp = Math.floor(Date.now() / 1000);

// CRITICAL FIX: Stringify the object so it matches the raw string sent via HTTP
const rawBodyString = JSON.stringify(body);

const signature = crypto
  .createHmac("sha256", secret)
  .update(`${timestamp}.${rawBodyString}`)
  .digest("hex");

console.log("=== EXACT POSTMAN RAW BODY ===");
console.log(rawBodyString);
console.log("\n=== POSTMAN HEADERS ===");
console.log("x-webhook-timestamp:", timestamp);
console.log("x-webhook-signature:", signature);
