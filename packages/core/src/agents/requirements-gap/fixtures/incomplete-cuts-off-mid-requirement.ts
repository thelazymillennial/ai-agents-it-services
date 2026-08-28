import type { RequirementsGapFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const text = `Feature: Two-Factor Authentication

When a user enables 2FA, the system sends a 6-digit code via SMS. The user must enter the code within`;

export const incompleteCutsOffMidRequirement: RequirementsGapFixture = {
  name: "incomplete-cuts-off-mid-requirement",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsTimeLimit = result.output?.missing_information.some((g) =>
        g.text.toLowerCase().includes("time") ||
        g.text.toLowerCase().includes("limit") ||
        g.text.toLowerCase().includes("expir")
      );
      return {
        pass: !!mentionsTimeLimit,
        message: `expected a missing_information item noting the code entry time limit is never specified, got ${JSON.stringify(
          result.output?.missing_information
        )}`,
      };
    },
  ],
};
