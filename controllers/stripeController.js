import WebhookEvent from "../models/webhookEvent.js";
import webhookQueue from "../queues/webhookQueue.js";

export const handleStripeWebhook = async (req, res) => {
  let eventId;

  try {
    const event = req.stripeEvent;

    if (!event || !event.id) {
      return res.status(400).json({
        message: "Invalid Stripe event",
      });
    }

    eventId = event.id;
    const eventType = event.type;

    const webhookEvent = new WebhookEvent({
      eventId,
      source: "stripe",
      eventType,
      payload: event.data.object,
      rawBody: req.rawBody,
      receivedAt: new Date(),
      status: "RECEIVED",
    });

    const savedEvent = await webhookEvent.save();

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

    console.log(`Stripe ${eventType} event saved:`, savedEvent._id);

    return res.status(200).json({
      message: "Webhook received successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate Stripe event detected, checking status");

      const existingEvent = await WebhookEvent.findOne({
        source: "stripe",
        eventId,
      });

      if (existingEvent && existingEvent.status !== "SUCCESS") {
        console.log(
          `Re-enqueueing event ${eventId} with status ${existingEvent.status}`
        );

        await webhookQueue.add(
          "process-webhook",
          {
            webhookEventId: existingEvent._id.toString(),
          },
          {
            jobId: eventId, // Prevents duplicate jobs in queue
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );
      }

      return res.status(200).json({
        message: "Webhook event already processed",
      });
    }

    console.error("Error saving Stripe webhook:", error);
    return res.status(500).json({
      message: "Failed to save webhook",
    });
  }
};
