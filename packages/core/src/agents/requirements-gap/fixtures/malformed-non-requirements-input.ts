import type { RequirementsGapFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const text = "###@@@ 0x1A 0x2B garbled-fragment ---- ???? ~~~~ %%%%";

export const malformedNonRequirementsInput: RequirementsGapFixture = {
  name: "malformed-non-requirements-input",
  input: { text },
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
