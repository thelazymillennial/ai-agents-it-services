export type FixtureAssertionResult = { pass: boolean; message: string };
export type FixtureAssertion<TResult> = (
  result: TResult
) => FixtureAssertionResult;

export type Fixture<TInput, TResult> = {
  name: string;
  input: TInput;
  assertions: FixtureAssertion<TResult>[];
};

export type FixtureOutcome = {
  name: string;
  passed: boolean;
  assertionResults: FixtureAssertionResult[];
  error?: string;
};

export type EvalSummary = {
  total: number;
  passed: number;
  failed: number;
  outcomes: FixtureOutcome[];
};

export async function runFixtures<TInput, TResult>(
  fixtures: Fixture<TInput, TResult>[],
  run: (input: TInput) => Promise<TResult>
): Promise<EvalSummary> {
  const outcomes: FixtureOutcome[] = [];

  for (const fixture of fixtures) {
    try {
      const result = await run(fixture.input);
      const assertionResults = fixture.assertions.map((assertion) => assertion(result));
      outcomes.push({
        name: fixture.name,
        passed: assertionResults.every((a) => a.pass),
        assertionResults,
      });
    } catch (err) {
      outcomes.push({
        name: fixture.name,
        passed: false,
        assertionResults: [],
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    total: outcomes.length,
    passed: outcomes.filter((o) => o.passed).length,
    failed: outcomes.filter((o) => !o.passed).length,
    outcomes,
  };
}

export function printEvalSummary(summary: EvalSummary): void {
  for (const outcome of summary.outcomes) {
    const icon = outcome.passed ? "PASS" : "FAIL";
    console.log(`[${icon}] ${outcome.name}`);
    if (outcome.error) {
      console.log(`       error: ${outcome.error}`);
    }
    for (const assertion of outcome.assertionResults) {
      if (!assertion.pass) {
        console.log(`       - ${assertion.message}`);
      }
    }
  }
  console.log(`\n${summary.passed}/${summary.total} fixtures passed`);
}
