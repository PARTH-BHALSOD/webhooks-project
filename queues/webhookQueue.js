import { Queue } from "bullmq";
import redisConfig from "../config/redis.js";

const webhookQueue = new Queue("webhook-processing", {
    connection: redisConfig
});

export default webhookQueue; //clll