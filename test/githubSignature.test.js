import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import crypto from "crypto";
import verifyGithubSignature from "../middleware/githubSignature.js";

const SECRET = "gh_test_secret";
const body = JSON.stringify({ zen: "hello" });

const makeApp = () => {
  const app = express();
  app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString("utf8"); } }));
  app.post("/github", verifyGithubSignature, (req, res) => res.sendStatus(200));
  return app;
};

const sign = (b) =>
  "sha256=" + crypto.createHmac("sha256", SECRET).update(b).digest("hex");

beforeAll(() => {
  process.env.GITHUB_WEBHOOK_SECRET = SECRET;
});

describe("GitHub signature middleware", () => {
  it("accepts a valid signature", async () => {
    const res = await request(makeApp())
      .post("/github")
      .set("Content-Type", "application/json")
      .set("X-Hub-Signature-256", sign(body))
      .send(body);
    expect(res.status).toBe(200);
  });

  it("returns 401 (not 500) for a wrong-length signature", async () => {
    const res = await request(makeApp())
      .post("/github")
      .set("Content-Type", "application/json")
      .set("X-Hub-Signature-256", "sha256=abc")
      .send(body);
    expect(res.status).toBe(401);
  });

  it("rejects a signature for a different body", async () => {
    const res = await request(makeApp())
      .post("/github")
      .set("Content-Type", "application/json")
      .set("X-Hub-Signature-256", sign('{"zen":"other"}'))
      .send(body);
    expect(res.status).toBe(401);
  });
});