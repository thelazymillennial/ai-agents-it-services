## 📝 Meeting → Action Agent

Turns a meeting transcript into decisions and action items — evidence-backed, never inventing an owner or a due date the transcript doesn't support.

Meeting summarization is common; reliable action extraction is harder. The useful product here isn't a generic summary, it's a trustworthy transition from discussion to accountable work: every claim traces back to a real line in the transcript, and anything ambiguous stays `"Unknown"` instead of getting guessed.

### Features

- Extracts decisions, action items (owner / due date / status), blockers, open questions, and follow-ups from a raw transcript
- Every decision and action item carries an evidence locator pointing at the transcript line it came from — validated against the real transcript, not just checked for presence
- Never assigns an owner or a due date unless the transcript explicitly supports it; disputed or implied ownership becomes `"Unknown"` plus an open question, not a guess
- Treats the transcript (and any supplied meeting metadata) as untrusted data, not instructions — resistant to prompt-injection attempts embedded in the dialogue
- Explicitly flags unusable input (empty, garbled, unrelated) as `insufficient_evidence` instead of fabricating a plausible-looking result
- Backed by a 12-fixture eval suite covering normal, incomplete, contradictory, adversarial, long, and malformed transcripts

### How to get started

1. From the repo root, install dependencies and set your API key:

   ```bash
   npm install
   cp .env.example .env   # then fill in ANTHROPIC_API_KEY
   ```

2. Run it against a transcript file (`.txt` or `.md`):

   ```bash
   npm run meeting-action -w @ai-agents-it-services/core -- path/to/transcript.txt
   ```

   This prints a JSON `AgentResult` with the extracted decisions, action items, blockers, open questions, and follow-ups.

3. Run the eval suite (12 fixtures against the real Claude API):

   ```bash
   npm run evals:meeting-action -w @ai-agents-it-services/core
   ```

4. Run the unit test suite (no API key required):

   ```bash
   npm test -w @ai-agents-it-services/core
   ```

### How it works

```
transcript (+ optional date/title/attendees)
      ↓
numbered SourceDocument (each line becomes a citable "L<n>" locator)
      ↓
system prompt (grounding rules + injection defense) + user message
      ↓
Claude, forced to respond via a single structured tool call
      ↓
Zod schema validation (including a cross-field check: insufficient_evidence
must not coexist with populated decisions/action items)
      ↓
evidence-locator validation against the real transcript line range
      ↓
AgentResult — status: complete | insufficient_evidence, plus evidence
```

A schema-validation failure or an invalid evidence locator triggers one retry before the pipeline raises an error — it never silently returns a result it can't stand behind.

### Known limitations

- Text/Markdown input only — no PDF/DOCX support yet
- CLI only — no UI
- Single-transcript context — no memory across meetings
- Retries on a bad response reuse the same prompt; the model isn't shown what was wrong with its previous attempt
