import express from "express";
import verifyWebhookSignature from "../middleware/webhookSignature.js";
import verifyGithubSignature from "../middleware/githubSignature.js";
import verifyStripeSignature from "../middleware/stripeWebhookAuth.js";
import * as WebhookController from "../controllers/webhookController.js";
import * as GithubController from "../controllers/githubController.js";
import * as StripeController from "../controllers/stripeController.js";
import webhookRateLimit from "../middleware/webhookRateLimit.js";

const webhookRouter = express.Router();

webhookRouter.post(
    "/test",
    webhookRateLimit,
    verifyWebhookSignature,
    WebhookController.testWebhooks
);

webhookRouter.post(
    "/github",
    webhookRateLimit,
    verifyGithubSignature,
    GithubController.handleGithubWebhook
);

webhookRouter.post(
    "/stripe",
    webhookRateLimit,
    verifyStripeSignature,
    StripeController.handleStripeWebhook
);

export default webhookRouter;