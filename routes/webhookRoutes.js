import express from "express";
import verifyWebhookSignature from "../middleware/webhookSignature.js";
import verifyGithubSignature from "../middleware/githubSignature.js";
import * as WebhookController from "../controllers/webhookController.js";
import * as GithubController from "../controllers/githubController.js";
import webhookRateLimit from "../middleware/webhookRateLimit.js";

const webhookRouter = express.Router();

// Test webhook endpoint (your custom format)
webhookRouter.post(
    "/test",
    webhookRateLimit,
    verifyWebhookSignature,
    WebhookController.testWebhooks
);

// GitHub webhook endpoint (real GitHub format)
webhookRouter.post(
    "/github",
    webhookRateLimit,
    verifyGithubSignature,
    GithubController.handleGithubWebhook
);

export default webhookRouter;