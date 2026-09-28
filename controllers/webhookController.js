import WebhookEvent from "../models/WebhookEvent.js";
import webhookSchema from "../validators/webhookValidator.js";
import webhookQueue from "../queues/webhookQueue.js";

export const testWebhooks = async (req, res) => {
  try {
    const result = webhookSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid webhook data",
        errors: result.error.issues,
      });
    }

    const { eventId, source, eventType, payload } = result.data;

    const webhookEvent = new WebhookEvent({
      eventId,
      source,
      eventType,
      payload,
      rawBody: req.rawBody, 
      receivedAt: new Date(),
      status: "RECEIVED"
    });

    const savedEvent = await webhookEvent.save();

    await webhookQueue.add(
      "process-webhook",
      {
        webhookEventId: savedEvent._id.toString()
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    );

    console.log("Event saved:", savedEvent);

    return res.status(201).json({
      message: "Webhook saved successfully",
      event: savedEvent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Webhook event already exists",
      });
    } else {
      return res.status(500).json({
        message: "Failed to save webhook",
      });
    }
  }
};