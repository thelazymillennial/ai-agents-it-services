import { describe, expect, it } from "vitest";
import { runFixtures } from "./runFixtures.js";

describe("runFixtures", () => {
  it("marks a fixture passed when all assertions pass", async () => {
    const summary = await runFixtures(
      [
        {
          name: "ok",
          input: 1,
          assertions: [(r: number) => ({ pass: r === 2, message: "should double" })],
        },
      ],
      async (n: number) => n * 2
    );
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(0);
  });

  it("marks a fixture failed when an assertion fails", async () => {
    const summary = await runFixtures(
      [
        {
          name: "bad",
          input: 1,
          assertions: [(r: number) => ({ pass: r === 99, message: "wrong" })],
        },
      ],
      async (n: number) => n * 2
    );
    expect(summary.failed).toBe(1);
    expect(summary.outcomes[0].assertionResults[0].message).toBe("wrong");
  });

  it("records a thrown error as a failure instead of throwing", async () => {
    const summary = await runFixtures(
      [{ name: "throws", input: 1, assertions: [] }],
      async () => {
        throw new Error("boom");
      }
    );
    expect(summary.failed).toBe(1);
    expect(summary.outcomes[0].error).toBe("boom");
  });
});
