import WebhookEvent from "../models/webhookEvent.js";
import webhookQueue from "../queues/webhookQueue.js";

const jobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
};

export const handleGithubWebhook = async (req, res) => {
  const eventType = req.headers["x-github-event"];
  const eventId = req.headers["x-github-delivery"];

  if (!eventType || !eventId) {
    return res.status(400).json({ message: "Missing GitHub event headers" });
  }

  try {
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

    await webhookQueue.add(
      "process-webhook",
      { webhookEventId: savedEvent._id.toString() },
      jobOptions
    );

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate delivery: re-enqueue only if it never finished processing
      const existingEvent = await WebhookEvent.findOne({
        source: "github",
        eventId,
      });

      if (existingEvent && existingEvent.status !== "SUCCESS") {
        await webhookQueue.add(
          "process-webhook",
          { webhookEventId: existingEvent._id.toString() },
          { jobId: eventId, ...jobOptions }
        );
      }

      return res.status(200).json({ message: "Webhook event already processed" });
    }

    console.error("Error saving GitHub webhook:", error);
    return res.status(500).json({ message: "Failed to save webhook" });
  }
};