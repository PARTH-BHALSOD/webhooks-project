import express from "express";
import verifyWebhookSignature from "../middleware/webhookSignature.js";
import * as WebhookController from "../controllers/webhookController.js";
import webhookRateLimit from "../middleware/webhookRateLimit.js";

const webhookRouter = express.Router();

webhookRouter.post(
    "/test",
    webhookRateLimit,
    verifyWebhookSignature,
    WebhookController.testWebhooks
);

export default webhookRouter;