import { notify } from "../services/notifier.js";

const stripeHandler = async (evt) => {
  const p = evt.payload;
  const eventType = evt.eventType;

  if (eventType === "payment_intent.succeeded") {
    const amount = (p.amount / 100).toFixed(2);
    const currency = p.currency.toUpperCase();
    const customerId = p.customer || "Unknown";

    const message = `💳 **Payment Successful**\n💰 Amount: ${amount} ${currency}\n👤 Customer: ${customerId}\n✅ Payment ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "payment_intent.payment_failed") {
    const amount = (p.amount / 100).toFixed(2);
    const currency = p.currency.toUpperCase();
    const error = p.last_payment_error?.message || "Unknown error";

    const message = `❌ **Payment Failed**\n💰 Amount: ${amount} ${currency}\n⚠️ Error: ${error}\n🔗 Payment ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "charge.succeeded") {
    const amount = (p.amount / 100).toFixed(2);
    const currency = p.currency.toUpperCase();

    const message = `✅ **Charge Successful**\n💵 ${amount} ${currency}\n📧 Receipt: ${p.receipt_url || "N/A"}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "charge.refunded") {
    const amountRefunded = (p.amount_refunded / 100).toFixed(2);
    const currency = p.currency.toUpperCase();

    const message = `↩️ **Refund Processed**\n💸 Amount: ${amountRefunded} ${currency}\n🔗 Charge ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "customer.subscription.created") {
    const status = p.status;
    const planName = p.items.data[0]?.price.id || "Unknown Plan";
    const customerId = p.customer;

    const message = `🎉 **New Subscription**\n📦 Plan: ${planName}\n👤 Customer: ${customerId}\n📊 Status: ${status}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "customer.subscription.updated") {
    const status = p.status;
    const customerId = p.customer;

    const message = `🔄 **Subscription Updated**\n👤 Customer: ${customerId}\n📊 Status: ${status}\n🔗 Subscription ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "customer.subscription.deleted") {
    const customerId = p.customer;

    const message = `🚫 **Subscription Cancelled**\n👤 Customer: ${customerId}\n📅 Ended: ${new Date(p.ended_at * 1000).toLocaleDateString()}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "invoice.payment_succeeded") {
    const amount = (p.amount_paid / 100).toFixed(2);
    const currency = p.currency.toUpperCase();

    const message = `📄 **Invoice Paid**\n💰 Amount: ${amount} ${currency}\n📧 Invoice: ${p.hosted_invoice_url || "N/A"}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "invoice.payment_failed") {
    const amount = (p.amount_due / 100).toFixed(2);
    const currency = p.currency.toUpperCase();

    const message = `⚠️ **Invoice Payment Failed**\n💰 Amount Due: ${amount} ${currency}\n🔗 Invoice ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  else if (eventType === "customer.created") {
    const email = p.email || "No email";

    const message = `👤 **New Customer**\n📧 Email: ${email}\n🆔 Customer ID: ${p.id}`;

    await notify({
      dedupeKey: `stripe:${evt.eventId}`,
      message,
    });
  }

  return { success: true };
};

export default stripeHandler;
