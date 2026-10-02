import WebhookEvent from "../models/WebhookEvent.js";
import githubHandler from "../handlers/githubHandler.js";

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

    // Route to appropriate handler based on source
    if (webhookEvent.source === "github") {
        handlerResult = await githubHandler(webhookEvent);
    } else {
        throw new Error(
            `No handler found for source: ${webhookEvent.source} and event type: ${webhookEvent.eventType}`
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

export default processWebhook;