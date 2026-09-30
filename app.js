import express from "express";
import webhookRouter from "./routes/webhookRoutes.js";

const app = express();
app.set('trust proxy', 1);

// Required to capture the raw buffer for HMAC-SHA256 signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/webhooks", webhookRouter);

export default app;
