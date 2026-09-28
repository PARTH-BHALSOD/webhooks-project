import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["stripe", "github", "twilio", "test"],
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    rawBody: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSING", "SUCCESS", "FAILED", "RETRYING"],
      required: true,
      default: "RECEIVED",
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

webhookSchema.index({ source: 1, eventId: 1 }, { unique: true });

const WebhookEvent = mongoose.model("WebhookEvent", webhookSchema);

export default WebhookEvent;