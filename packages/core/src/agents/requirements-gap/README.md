## 🔍 Requirements Gap Agent

Finds ambiguity, missing acceptance criteria, undefined terms, contradictions, edge
cases and testability issues in a requirements document — before it reaches
engineering or QA.

Poor requirements multiply downstream rework. This agent doesn't rewrite your
requirement or invent the missing domain policy for you — it tells you exactly what's
unclear, why it matters, and where in the document it came from, so a human can
resolve it deliberately instead of guessing three days later.

### Features

- Finds ambiguities, missing information, contradictions, undefined terms, edge cases
  and testability issues in a single pass over a requirements document
- Every finding carries an impact statement and an evidence locator — validated
  against the real document, not just checked for presence
- Contradictions carry evidence from both conflicting statements
- Never invents domain policy to fill a gap, and never rewrites a requirement as
  settled fact — findings are suggestions for a human reviewer
- Treats the document as untrusted data, not instructions — resistant to
  prompt-injection attempts embedded in the requirements text, including attempts to
  make it report zero issues
- Explicitly flags unusable input (empty, garbled, unrelated) as `insufficient_evidence`
  instead of fabricating a plausible-looking analysis
- Backed by a 12-fixture eval suite covering normal, incomplete, contradictory,
  adversarial, long, and malformed documents

### How to get started

1. From the repo root, install dependencies and set your API key:

   ```bash
   npm install
   cp .env.example .env   # then fill in ANTHROPIC_API_KEY
   ```

2. Run it against a requirements document (`.txt` or `.md`):

   ```bash
   npm run requirements-gap -w @ai-agents-it-services/core -- path/to/requirements.txt
   ```

   This prints a JSON `AgentResult` with the ambiguities, missing information,
   contradictions, undefined terms, edge cases, testability issues and stakeholder
   questions found.

3. Run the eval suite (12 fixtures against the real Claude API):

   ```bash
   npm run evals:requirements-gap -w @ai-agents-it-services/core
   ```

4. Run the unit test suite (no API key required):

   ```bash
   npm test -w @ai-agents-it-services/core
   ```

### How it works

```
requirements document
      ↓
numbered SourceDocument (each line becomes a citable "L<n>" locator)
      ↓
system prompt (systematic gap checklist + injection defense) + user message
      ↓
Claude, forced to respond via a single structured tool call
      ↓
Zod schema validation (including a cross-field check: insufficient_evidence
must not coexist with any populated finding array)
      ↓
evidence-locator validation against the real document's line range
      ↓
AgentResult — status: complete | insufficient_evidence, plus evidence
```

Shares its pipeline shape and safety guarantees with the
[Meeting → Action Agent](../meeting-action/) — same retry-then-error behavior on a
bad or self-inconsistent response, same evidence-locator validation.

### Known limitations

- Text/Markdown input only — no PDF/DOCX support yet
- CLI only — no UI, no "accept/dismiss individual finding" workflow yet
- Single-document context — doesn't cross-reference against a separate design doc or
  prior requirements version
- Retries on a bad response reuse the same prompt; the model isn't shown what was
  wrong with its previous attempt
