const { default: mongoose } = require("mongoose");

const webhookShcema = new mongoose.Schema(
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

webhookShcema.index({ source: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("WebhookEvent", webhookShcema);
