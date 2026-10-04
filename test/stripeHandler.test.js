import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/notifier.js", () => ({ notify: vi.fn() }));

import { notify } from "../services/notifier.js";
import stripeHandler from "../handlers/stripeHandler.js";
import { formatMoney } from "../utils/formatMoney.js";

beforeEach(() => notify.mockClear());

describe("formatMoney", () => {
  it("divides by 100 for normal currencies", () => {
    expect(formatMoney(1234, "usd")).toBe("$12.34");
  });
  it("does not divide for zero-decimal currencies", () => {
    expect(formatMoney(1000, "jpy")).toContain("1,000");
  });
});

describe("stripeHandler", () => {
  it("sends one notification for payment_intent.succeeded", async () => {
    await stripeHandler({
      eventId: "evt_1",
      eventType: "payment_intent.succeeded",
      payload: { id: "pi_1", amount: 5000, currency: "usd", customer: "cus_1" },
    });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0].dedupeKey).toBe("stripe:evt_1");
    expect(notify.mock.calls[0][0].message).toContain("$50.00");
  });

  it("ignores charge.succeeded (avoids duplicate messages per payment)", async () => {
    await stripeHandler({
      eventId: "evt_2",
      eventType: "charge.succeeded",
      payload: { id: "ch_1", amount: 5000, currency: "usd" },
    });
    expect(notify).not.toHaveBeenCalled();
  });
});