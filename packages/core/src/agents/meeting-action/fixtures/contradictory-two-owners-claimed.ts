import type { MeetingActionFixture } from "./types.js";
import { statusIs, ownerIsUnknownFor } from "../assertions.js";

const transcript = `Jen: Who's handling the SSL certificate renewal?
Tom: I thought Priya was doing it.
Priya: No, I thought Tom was on it.
Jen: Let's just make sure someone owns it before Friday.`;

export const contradictoryTwoOwnersClaimed: MeetingActionFixture = {
  name: "contradictory-two-owners-claimed",
  input: { transcript, metadata: { date: "2026-08-24" } },
  assertions: [
    statusIs("complete"),
    ownerIsUnknownFor("certificate"),
    (result) => {
      const mentionsOwnershipDispute = result.output?.open_questions.some((q) =>
        q.toLowerCase().includes("certificate") || q.toLowerCase().includes("owner")
      );
      return {
        pass: !!mentionsOwnershipDispute,
        message: `expected an open question about the certificate ownership dispute, got ${JSON.stringify(result.output?.open_questions)}`,
      };
    },
  ],
};
