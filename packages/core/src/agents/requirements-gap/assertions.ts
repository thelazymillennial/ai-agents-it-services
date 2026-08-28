import type { AgentResult, AgentStatus } from "../../lib/types.js";
import type { RequirementsGapOutput } from "./schema.js";

export type AssertionResult = { pass: boolean; message: string };
export type Assertion = (
  result: AgentResult<RequirementsGapOutput>
) => AssertionResult;

export function statusIs(expected: AgentStatus): Assertion {
  return (result) => ({
    pass: result.status === expected,
    message: `expected status "${expected}", got "${result.status}"`,
  });
}

export function ambiguityCountAtLeast(min: number): Assertion {
  return (result) => {
    const count = result.output?.ambiguities.length ?? 0;
    return {
      pass: count >= min,
      message: `expected at least ${min} ambiguities, got ${count}`,
    };
  };
}

export function contradictionMentions(substring: string): Assertion {
  return (result) => {
    const found = result.output?.contradictions.some((c) =>
      c.text.toLowerCase().includes(substring.toLowerCase())
    );
    return {
      pass: !!found,
      message: found
        ? "found a contradiction mentioning the expected topic"
        : `expected a contradiction mentioning "${substring}", got ${JSON.stringify(
            result.output?.contradictions
          )}`,
    };
  };
}

export function undefinedTermFound(term: string): Assertion {
  return (result) => {
    const found = result.output?.undefined_terms.some(
      (u) => u.term.toLowerCase() === term.toLowerCase()
    );
    return {
      pass: !!found,
      message: found
        ? `found undefined term "${term}"`
        : `expected undefined term "${term}", got ${JSON.stringify(
            result.output?.undefined_terms
          )}`,
    };
  };
}

export function everyGapHasEvidence(): Assertion {
  return (result) => {
    const allGaps = [
      ...(result.output?.ambiguities ?? []),
      ...(result.output?.missing_information ?? []),
      ...(result.output?.edge_cases ?? []),
      ...(result.output?.testability_issues ?? []),
    ];
    const missing = allGaps.find((g) => !g.evidence.locator?.trim());
    return {
      pass: !missing,
      message: missing
        ? `gap "${missing.text}" is missing an evidence locator`
        : "every gap has an evidence locator",
    };
  };
}

export function everyContradictionHasTwoSidedEvidence(): Assertion {
  return (result) => {
    const missing = (result.output?.contradictions ?? []).find(
      (c) => !c.evidence_a.locator?.trim() || !c.evidence_b.locator?.trim()
    );
    return {
      pass: !missing,
      message: missing
        ? `contradiction "${missing.text}" is missing evidence on one side`
        : "every contradiction has two-sided evidence",
    };
  };
}

export function noGapMentions(disallowedSubstring: string): Assertion {
  return (result) => {
    const allText = [
      ...(result.output?.ambiguities.map((g) => g.text) ?? []),
      ...(result.output?.missing_information.map((g) => g.text) ?? []),
      ...(result.output?.edge_cases.map((g) => g.text) ?? []),
      ...(result.output?.testability_issues.map((g) => g.text) ?? []),
      ...(result.output?.contradictions.map((c) => c.text) ?? []),
      ...(result.output?.undefined_terms.map((u) => u.term) ?? []),
      ...(result.output?.stakeholder_questions ?? []),
      result.output?.summary ?? "",
    ]
      .join(" ")
      .toLowerCase();
    const found = allText.includes(disallowedSubstring.toLowerCase());
    return {
      pass: !found,
      message: found
        ? `expected output to not mention "${disallowedSubstring}", but it did`
        : `no mention of "${disallowedSubstring}" found`,
    };
  };
}
