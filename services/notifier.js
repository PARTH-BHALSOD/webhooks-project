import Notification from "../models/Notification.js";

const sendDiscord = async (text) => {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    throw new Error("DISCORD_WEBHOOK_URL not configured");
  }

  const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: text.slice(0, 1900), // Discord limit is 2000 chars
      allowed_mentions: { parse: [] }, // never ping @everyone/@here/users
    }),
  });

  if (!res.ok) {
    throw new Error(`Discord failed: ${res.status} ${res.statusText}`);
  }

  return res;
};

export const notify = async ({ dedupeKey, message }) => {
  const existing = await Notification.findOne({ dedupeKey });
  if (existing?.status === "SENT") {
    console.log(`Notification already sent for dedupeKey: ${dedupeKey}`);
    return;
  }

  try {
    await sendDiscord(message);

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

    throw error;
  }
};
