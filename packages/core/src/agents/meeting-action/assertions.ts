import type { AgentResult, AgentStatus } from "../../lib/types.js";
import type { MeetingActionOutput } from "./schema.js";

export type AssertionResult = { pass: boolean; message: string };
export type Assertion = (
  result: AgentResult<MeetingActionOutput>
) => AssertionResult;

export function statusIs(expected: AgentStatus): Assertion {
  return (result) => ({
    pass: result.status === expected,
    message: `expected status "${expected}", got "${result.status}"`,
  });
}

export function noInventedOwners(disallowedOwners: string[]): Assertion {
  return (result) => {
    const found = (result.output?.action_items ?? []).find((item) =>
      disallowedOwners.includes(item.owner)
    );
    return {
      pass: !found,
      message: found
        ? `action item "${found.action}" was assigned to disallowed owner "${found.owner}"`
        : "no disallowed owners found",
    };
  };
}

export function everyActionItemHasEvidence(): Assertion {
  return (result) => {
    const missing = (result.output?.action_items ?? []).find(
      (item) => !item.evidence.locator?.trim()
    );
    return {
      pass: !missing,
      message: missing
        ? `action item "${missing.action}" is missing an evidence locator`
        : "every action item has an evidence locator",
    };
  };
}

export function everyDecisionHasEvidence(): Assertion {
  return (result) => {
    const missing = (result.output?.decisions ?? []).find(
      (decision) => !decision.evidence.locator?.trim()
    );
    return {
      pass: !missing,
      message: missing
        ? `decision "${missing.text}" is missing an evidence locator`
        : "every decision has an evidence locator",
    };
  };
}

export function actionItemCountAtLeast(min: number): Assertion {
  return (result) => {
    const count = result.output?.action_items.length ?? 0;
    return {
      pass: count >= min,
      message: `expected at least ${min} action items, got ${count}`,
    };
  };
}

export function ownerIsUnknownFor(actionSubstring: string): Assertion {
  return (result) => {
    const item = (result.output?.action_items ?? []).find((a) =>
      a.action.toLowerCase().includes(actionSubstring.toLowerCase())
    );
    if (!item) {
      return { pass: false, message: `no action item matching "${actionSubstring}" found` };
    }
    return {
      pass: item.owner === "Unknown",
      message: `expected owner "Unknown" for "${actionSubstring}", got "${item.owner}"`,
    };
  };
}

export function dueDateIsUnknownFor(actionSubstring: string): Assertion {
  return (result) => {
    const item = (result.output?.action_items ?? []).find((a) =>
      a.action.toLowerCase().includes(actionSubstring.toLowerCase())
    );
    if (!item) {
      return { pass: false, message: `no action item matching "${actionSubstring}" found` };
    }
    return {
      pass: item.due_date === "Unknown",
      message: `expected due_date "Unknown" for "${actionSubstring}", got "${item.due_date}"`,
    };
  };
}
