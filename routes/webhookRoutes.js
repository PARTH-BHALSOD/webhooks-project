const express = require("express");
const webhookRouter = express.Router();
const verifyWebhookSignature = require("../middleware/webhookSignature");
const WebhookController = require('../controller/webhookController');
const webhookRateLimit = require("../middleware/webhookRateLimit");

webhookRouter.post(
    "/test",
    webhookRateLimit,
    verifyWebhookSignature,
    WebhookController.testWebhooks
);

module.exports = webhookRouter;
