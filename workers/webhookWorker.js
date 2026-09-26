const { Worker } = require("bullmq");

const redisConfig = require("../config/redis");
const db = require("../config/database");
const WebhookEvent = require("../models/WebhookEvent");
const processWebhook = require("../services/webhookProcessor");

db().then(() => {
    const webhookWorker = new Worker(
        "webhook-processing",

        async (job) => {
            console.log("\n==============================");
            console.log("Worker received job");
            console.log("Attempt:", job.attemptsMade + 1);
            console.log("Job data:", job.data);

            try {
                await processWebhook(job.data.webhookEventId);

            } catch (error) {
                console.error("PROCESSING ERROR:", error.message);

                const webhookEvent = await WebhookEvent.findById(
                    job.data.webhookEventId
                );

                if (webhookEvent) {
                    const currentAttempt = job.attemptsMade + 1;
                    const maxAttempts = job.opts.attempts || 1;

                    webhookEvent.error = {
                        message: error.message
                    };

                    webhookEvent.status =
                        currentAttempt < maxAttempts
                            ? "RETRYING"
                            : "FAILED";

                    await webhookEvent.save();

                    console.log("Status:", webhookEvent.status);
                }

                throw error;
            }
        },

        {
            connection: redisConfig
        }
    );

    console.log("Webhook worker is running.");

    webhookWorker.on("failed", (job, error) => {
        console.log(
            `Job failed: ${job?.id} | ${error.message}`
        );
    });
});