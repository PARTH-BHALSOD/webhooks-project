import { z } from "zod";

const webhookSchema = z.object({
  eventId: z.string(),
  source: z.enum(["stripe", "github", "twilio", "test"]),
  eventType: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

export default webhookSchema;
