const WebhookEvent = require("../models/WebhookEvent");
const testHandler = require("../handlers/testHandler");

const processWebhook = async (webhookEventId) => {
    const webhookEvent = await WebhookEvent.findById(webhookEventId);

    if (!webhookEvent) {
        throw new Error("Webhook event not found");
    }

    if (webhookEvent.status === "SUCCESS") {
        console.log("Webhook already processed:", webhookEvent.eventId);
        return webhookEvent;
    }

    webhookEvent.attempts += 1;
    webhookEvent.status = "PROCESSING";

    await webhookEvent.save();

    let handlerResult;

    if (webhookEvent.eventType === "test.event") {
        handlerResult = await testHandler(webhookEvent);
    } else {
        throw new Error(
            `No handler found for event type: ${webhookEvent.eventType}`
        );
    }

    if (!handlerResult.success) {
        throw new Error("Webhook handler failed");
    }

    webhookEvent.status = "SUCCESS";
    webhookEvent.processedAt = new Date();

    await webhookEvent.save();

    return webhookEvent;
};

module.exports = processWebhook;