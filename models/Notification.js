import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    dedupeKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["discord", "slack", "email"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
      required: true,
    },
    sentAt: {
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

// Auto-delete notification records 30 days after creation
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
