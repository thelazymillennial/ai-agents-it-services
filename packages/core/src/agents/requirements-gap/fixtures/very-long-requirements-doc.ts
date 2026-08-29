import type { RequirementsGapFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const fillerLines = Array.from(
  { length: 100 },
  (_, i) =>
    `Requirement FR-${i + 1}: The system shall log event type ${i + 1} to the audit trail with a timestamp.`
);

const text = [
  "Feature: Notification Preferences",
  ...fillerLines.slice(0, 50),
  "Requirement FR-51: Users can opt out of promotional emails, but the process for opting out of transactional emails is not specified anywhere in this document.",
  ...fillerLines.slice(50),
  "End of requirements document.",
].join("\n");

export const veryLongRequirementsDoc: RequirementsGapFixture = {
  name: "very-long-requirements-doc",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsTransactional = result.output?.missing_information.some((g) =>
        g.text.toLowerCase().includes("transactional")
      );
      return {
        pass: !!mentionsTransactional,
        message: `expected a missing_information item about opting out of transactional emails to survive extraction from a long document, got ${JSON.stringify(
          result.output?.missing_information
        )}`,
      };
    },
  ],
};
