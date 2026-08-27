import type { MeetingActionFixture } from "./types.js";
import { statusIs, actionItemCountAtLeast } from "../assertions.js";

const fillerLines = Array.from(
  { length: 120 },
  (_, i) => `Speaker${(i % 4) + 1}: Just a general status update, item ${i + 1}, nothing new to report.`
);

const transcript = [
  "Facilitator: Welcome everyone to this extended planning session.",
  ...fillerLines.slice(0, 60),
  "Facilitator: Okay, real item: Wei, please own the database index migration, due next Wednesday, September 2nd.",
  "Wei: Confirmed, I'll own the database index migration, due September 2nd.",
  ...fillerLines.slice(60),
  "Facilitator: That wraps up this long session.",
].join("\n");

export const veryLongTranscript: MeetingActionFixture = {
  name: "very-long-transcript",
  input: { transcript, metadata: { date: "2026-08-24" } },
  assertions: [
    statusIs("complete"),
    actionItemCountAtLeast(1),
    (result) => {
      const item = result.output?.action_items.find((a) =>
        a.action.toLowerCase().includes("database index migration")
      );
      return {
        pass: item?.owner === "Wei" && item?.due_date !== "Unknown",
        message: `expected the database-index-migration action to survive extraction from a long transcript, got ${JSON.stringify(item)}`,
      };
    },
  ],
};
