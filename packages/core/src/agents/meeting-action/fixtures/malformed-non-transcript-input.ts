import type { MeetingActionFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const transcript = "0x00 0x01 corrupted-binary-fragment %%%% ---- ???? @@@@ ~~~~";

export const malformedNonTranscriptInput: MeetingActionFixture = {
  name: "malformed-non-transcript-input",
  input: { transcript },
  assertions: [
    statusIs("insufficient_evidence"),
    (result) => ({
      pass: result.output === null,
      message: "expected null output for insufficient_evidence status",
    }),
    (result) => ({
      pass: result.missingInformation.length >= 1,
      message: "expected a missingInformation entry explaining the insufficient evidence",
    }),
  ],
};
