import type { RequirementsGapFixture } from "./types.js";
import { statusIs, everyGapHasEvidence } from "../assertions.js";

const text = `Feature: Profile Picture Upload

Users can upload a profile picture. The system accepts JPG and PNG files up to 5MB. Once uploaded, the picture replaces the previous profile picture immediately.`;

export const normalMultipleNfrGaps: RequirementsGapFixture = {
  name: "normal-multiple-nfr-gaps",
  input: { text },
  assertions: [
    statusIs("complete"),
    everyGapHasEvidence(),
    (result) => {
      const mentionsInvalidHandling = result.output?.missing_information.some((m) =>
        m.text.toLowerCase().includes("invalid") ||
        m.text.toLowerCase().includes("fail") ||
        m.text.toLowerCase().includes("reject") ||
        m.text.toLowerCase().includes("error")
      );
      return {
        pass: !!mentionsInvalidHandling,
        message: `expected a missing_information item about handling an invalid/rejected/failed upload, got ${JSON.stringify(result.output?.missing_information)}`,
      };
    },
    (result) => {
      const mentionsConcurrency = result.output?.edge_cases.some((e) =>
        e.text.toLowerCase().includes("concurrent") ||
        e.text.toLowerCase().includes("simultaneous") ||
        e.text.toLowerCase().includes("multiple") ||
        e.text.toLowerCase().includes("race")
      );
      return {
        pass: !!mentionsConcurrency,
        message: `expected an edge case about concurrent/simultaneous uploads, got ${JSON.stringify(result.output?.edge_cases)}`,
      };
    },
  ],
};
