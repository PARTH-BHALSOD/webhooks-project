const express = require("express");
const webhookRouter = require("./routes/webhookRoutes");

const app = express();
//for HMAC signature
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf.toString("utf8");
        }
    })
);

app.use(express.urlencoded({ extended: true }));

app.use("/webhooks",webhookRouter);

module.exports = app;
