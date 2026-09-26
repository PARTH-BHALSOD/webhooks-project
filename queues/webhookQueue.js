const { Queue } = require("bullmq");
const redisConfig = require("../config/redis");

const webhookQueue = new Queue("webhook-processing", {
    connection: redisConfig
});

module.exports = webhookQueue;