import WebhookEvent from "../models/webhookEvent.js";
import webhookQueue from "../queues/webhookQueue.js";

export const handleGithubWebhook = async (req, res) => {
  try {
    // GitHub sends event type in X-GitHub-Event header
    const eventType = req.headers["x-github-event"];
    const eventId = req.headers["x-github-delivery"];

    if (!eventType || !eventId) {
      return res.status(400).json({
        message: "Missing GitHub event headers",
      });
    }


    // Save to database
    const webhookEvent = new WebhookEvent({
      eventId,
      source: "github",
      eventType,
      payload: req.body,
      rawBody: req.rawBody,
      receivedAt: new Date(),
      status: "RECEIVED",
    });

    const savedEvent = await webhookEvent.save();

    // Add to queue for processing
    await webhookQueue.add(
      "process-webhook",
      {
        webhookEventId: savedEvent._id.toString(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    console.log(`GitHub ${eventType} event saved:`, savedEvent._id);

    // GitHub expects 200 for success
    return res.status(200).json({
      message: "Webhook received successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate event - GitHub retried
      // Return 200 so GitHub doesn't keep retrying
      return res.status(200).json({
        message: "Webhook event already processed",
      });
    } else {
      console.error("Error saving GitHub webhook:", error);
      return res.status(500).json({
        message: "Failed to save webhook",
      });
    }
  }
};
