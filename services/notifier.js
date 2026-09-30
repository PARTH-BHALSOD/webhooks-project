import Notification from "../models/Notification.js";

const sendDiscord = async (text) => {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    throw new Error("DISCORD_WEBHOOK_URL not configured");
  }

  const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });

  if (!res.ok) {
    throw new Error(`Discord failed: ${res.status} ${res.statusText}`);
  }

  return res;
};

export const notify = async ({ dedupeKey, message }) => {
  // Check if already sent (prevents duplicate notifications on retries)
  const existing = await Notification.findOne({ dedupeKey });
  if (existing?.status === "SENT") {
    console.log(`Notification already sent for dedupeKey: ${dedupeKey}`);
    return;
  }

  try {
    // Send to Discord
    await sendDiscord(message);

    // Mark as sent
    await Notification.updateOne(
      { dedupeKey },
      {
        $set: {
          message,
          channel: "discord",
          status: "SENT",
          sentAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`Notification sent successfully: ${dedupeKey}`);
  } catch (error) {
    // Save failed attempt
    await Notification.updateOne(
      { dedupeKey },
      {
        $set: {
          message,
          channel: "discord",
          status: "FAILED",
          error: error.message,
        },
      },
      { upsert: true }
    );

    // Re-throw to trigger BullMQ retry
    throw error;
  }
};
