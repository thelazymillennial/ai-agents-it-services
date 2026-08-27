import type { MeetingActionFixture } from "./types.js";
import { statusIs, ownerIsUnknownFor } from "../assertions.js";

const transcript = `Dana: Quick standup. Marcus, you're on the API rate-limit bug, due end of day tomorrow.
Marcus: Got it, I'll fix it by end of day tomorrow.
Dana: We also need someone to look at the flaky checkout test at some point.
Dana: Nobody's picked that up yet.
Dana: Anything else? No? Let's end here.`;

export const normalMixedExplicitVague: MeetingActionFixture = {
  name: "normal-mixed-explicit-vague",
  input: { transcript, metadata: { date: "2026-08-24", title: "Standup" } },
  assertions: [
    statusIs("complete"),
    ownerIsUnknownFor("checkout test"),
    (result) => {
      const item = result.output?.action_items.find((a) =>
        a.action.toLowerCase().includes("rate-limit")
      );
      return {
        pass: item?.owner === "Marcus",
        message: `expected rate-limit bug owned by Marcus, got ${JSON.stringify(item)}`,
      };
    },
  ],
};
