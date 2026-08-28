import type { RequirementsGapFixture } from "./types.js";
import { statusIs, undefinedTermFound, everyGapHasEvidence } from "../assertions.js";

const text = `Feature: Export Report as PDF

When a user clicks "Export", the system generates a PDF of their current report view and downloads it to their device. The export must comply with WCAG accessibility guidelines. The PDF filename follows the pattern report_<date>.pdf.`;

export const normalUndefinedAcronymOnly: RequirementsGapFixture = {
  name: "normal-undefined-acronym-only",
  input: { text },
  assertions: [
    statusIs("complete"),
    undefinedTermFound("WCAG"),
    everyGapHasEvidence(),
    (result) => {
      const otherFindingsCount =
        (result.output?.ambiguities.length ?? 0) +
        (result.output?.missing_information.length ?? 0) +
        (result.output?.edge_cases.length ?? 0) +
        (result.output?.testability_issues.length ?? 0);
      return {
        pass: otherFindingsCount <= 2,
        message: `expected at most 2 findings outside of the WCAG undefined-term gap for a near-clean document, got ${otherFindingsCount} (ambiguities: ${JSON.stringify(result.output?.ambiguities)}, missing_information: ${JSON.stringify(result.output?.missing_information)}, edge_cases: ${JSON.stringify(result.output?.edge_cases)}, testability_issues: ${JSON.stringify(result.output?.testability_issues)})`,
      };
    },
  ],
};
