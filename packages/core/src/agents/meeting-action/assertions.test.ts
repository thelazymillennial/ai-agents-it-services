import { describe, expect, it } from "vitest";
import type { AgentResult } from "../../lib/types.js";
import type { MeetingActionOutput } from "./schema.js";
import {
  statusIs,
  noInventedOwners,
  everyActionItemHasEvidence,
  everyDecisionHasEvidence,
  actionItemCountAtLeast,
  ownerIsUnknownFor,
  dueDateIsUnknownFor,
} from "./assertions.js";

function makeResult(
  overrides: Partial<MeetingActionOutput> = {}
): AgentResult<MeetingActionOutput> {
  return {
    status: "complete",
    output: {
      summary: "sync",
      decisions: [],
      action_items: [],
      blockers: [],
      open_questions: [],
      follow_ups: [],
      ...overrides,
    },
    evidence: [],
    assumptions: [],
    missingInformation: [],
  };
}

describe("statusIs", () => {
  it("passes when status matches", () => {
    expect(statusIs("complete")(makeResult()).pass).toBe(true);
  });

  it("fails when status does not match", () => {
    expect(statusIs("insufficient_evidence")(makeResult()).pass).toBe(false);
  });
});

describe("noInventedOwners", () => {
  it("fails when a disallowed owner appears", () => {
    const result = makeResult({
      action_items: [
        {
          action: "do thing",
          owner: "Alex",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "L1" },
          status: "open",
        },
      ],
    });
    expect(noInventedOwners(["Alex"])(result).pass).toBe(false);
  });

  it("passes when no disallowed owner appears", () => {
    const result = makeResult({
      action_items: [
        {
          action: "do thing",
          owner: "Priya",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "L1" },
          status: "open",
        },
      ],
    });
    expect(noInventedOwners(["Alex"])(result).pass).toBe(true);
  });
});

describe("everyActionItemHasEvidence / everyDecisionHasEvidence", () => {
  it("fails when an action item has an empty locator", () => {
    const result = makeResult({
      action_items: [
        {
          action: "do thing",
          owner: "Priya",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "" },
          status: "open",
        },
      ],
    });
    expect(everyActionItemHasEvidence()(result).pass).toBe(false);
  });

  it("fails when a decision has an empty locator", () => {
    const result = makeResult({
      decisions: [{ text: "ship it", evidence: { sourceId: "transcript-1", locator: "" } }],
    });
    expect(everyDecisionHasEvidence()(result).pass).toBe(false);
  });

  it("passes when every action item has a non-empty locator", () => {
    const result = makeResult({
      action_items: [
        {
          action: "do thing",
          owner: "Priya",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "L1" },
          status: "open",
        },
      ],
    });
    expect(everyActionItemHasEvidence()(result).pass).toBe(true);
  });

  it("passes when every decision has a non-empty locator", () => {
    const result = makeResult({
      decisions: [{ text: "ship it", evidence: { sourceId: "transcript-1", locator: "L1" } }],
    });
    expect(everyDecisionHasEvidence()(result).pass).toBe(true);
  });
});

describe("actionItemCountAtLeast", () => {
  it("fails when there are fewer items than expected", () => {
    expect(actionItemCountAtLeast(1)(makeResult()).pass).toBe(false);
  });

  it("passes when there are at least as many items as expected", () => {
    const result = makeResult({
      action_items: [
        {
          action: "do thing",
          owner: "Priya",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "L1" },
          status: "open",
        },
      ],
    });
    expect(actionItemCountAtLeast(1)(result).pass).toBe(true);
  });
});

describe("ownerIsUnknownFor / dueDateIsUnknownFor", () => {
  const result = makeResult({
    action_items: [
      {
        action: "renew the ssl certificate",
        owner: "Unknown",
        due_date: "Unknown",
        evidence: { sourceId: "transcript-1", locator: "L1" },
        status: "open",
      },
    ],
  });

  it("passes when the matching action item's owner is Unknown", () => {
    expect(ownerIsUnknownFor("ssl certificate")(result).pass).toBe(true);
  });

  it("passes when the matching action item's due date is Unknown", () => {
    expect(dueDateIsUnknownFor("ssl certificate")(result).pass).toBe(true);
  });

  it("fails when no action item matches the substring", () => {
    expect(ownerIsUnknownFor("nonexistent")(result).pass).toBe(false);
  });

  it("fails when the matching action item's owner is known", () => {
    const knownOwnerResult = makeResult({
      action_items: [
        {
          action: "renew the ssl certificate",
          owner: "Priya",
          due_date: "2026-09-01",
          evidence: { sourceId: "transcript-1", locator: "L1" },
          status: "open",
        },
      ],
    });
    expect(ownerIsUnknownFor("ssl certificate")(knownOwnerResult).pass).toBe(false);
    expect(dueDateIsUnknownFor("ssl certificate")(knownOwnerResult).pass).toBe(false);
  });
});
