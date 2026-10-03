import express from "express";
import webhookRouter from "./routes/webhookRoutes.js";

const app = express();
app.set('trust proxy', 1);

app.use(
  express.json({
    verify: (req, res, buf) => {
      // Stripe needs the raw Buffer, not a string
      // GitHub and custom webhooks work with string
      if (req.originalUrl.includes('/stripe')) {
        req.rawBody = buf;
      } else {
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/webhooks", webhookRouter);

export default app;
