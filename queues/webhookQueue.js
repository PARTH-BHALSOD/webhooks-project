import { Queue } from "bullmq";
import redisConfig from "../config/redis.js";

const webhookQueue = new Queue("webhook-processing", {
    connection: redisConfig,
    defaultJobOptions: {
        // Delete finished jobs after 1 hour, or once there are more than 1000
        removeOnComplete: { age: 60 * 60, count: 1000 },
        // Keep failed jobs for 7 days (or the last 5000) so you can inspect them
        removeOnFail: { age: 7 * 24 * 60 * 60, count: 5000 },
      },
});

export default webhookQueue;