import { notify } from "../services/notifier.js";
import { formatMoney } from "../utils/formatMoney.js";

const stripeHandler = async (evt) => {
  const p = evt.payload;
  const eventType = evt.eventType;
  let message;

  switch (eventType) {
    case "payment_intent.succeeded":
      message = `💳 **Payment Successful**\n💰 Amount: ${formatMoney(p.amount, p.currency)}\n👤 Customer: ${p.customer || "Unknown"}\n✅ Payment ID: ${p.id}`;
      break;

    case "payment_intent.payment_failed":
      message = `❌ **Payment Failed**\n💰 Amount: ${formatMoney(p.amount, p.currency)}\n⚠️ Error: ${p.last_payment_error?.message || "Unknown error"}\n🔗 Payment ID: ${p.id}`;
      break;

    case "charge.refunded":
      message = `↩️ **Refund Processed**\n💸 Refunded so far: ${formatMoney(p.amount_refunded, p.currency)}\n🔗 Charge ID: ${p.id}`;
      break;

    case "invoice.payment_failed":
      message = `⚠️ **Invoice Payment Failed**\n💰 Amount Due: ${formatMoney(p.amount_due, p.currency)}\n🔗 Invoice ID: ${p.id}`;
      break;

    case "customer.subscription.deleted":
      message = `🚫 **Subscription Cancelled**\n👤 Customer: ${p.customer}\n📅 Ended: ${p.ended_at ? new Date(p.ended_at * 1000).toLocaleDateString() : "N/A"}`;
      break;

    case "charge.dispute.created":
      message = `🚨 **Dispute Opened**\n💰 Amount: ${formatMoney(p.amount, p.currency)}\n📌 Reason: ${p.reason}\n🔗 Dispute ID: ${p.id}`;
      break;

    default:
      // Not an event we notify about (charge.succeeded, customer.created, ...)
      return { success: true, ignored: true };
  }

  await notify({ dedupeKey: `stripe:${evt.eventId}`, message });
  return { success: true };
};

export default stripeHandler;