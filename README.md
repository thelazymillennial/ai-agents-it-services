# AI Agents for IT Services

I'm building small, practical AI agents for workflows that people in IT-services teams still do manually — delivery, QA, support, PMO.

Each agent is a bounded job: file/paste input in, an evidence-backed structured result out, a human decides anything consequential. No hidden enterprise integrations required to get value.

## Shipped

### Meeting → Action Agent
Turns a meeting transcript into decisions, action items, owners, dates, blockers and open questions — without inventing an owner or due date the transcript doesn't support.

- Input: a meeting transcript (paste or `.txt`/`.md` file), optional date/title/attendees
- Output: structured decisions, action items (owner/due date/evidence), blockers, open questions, follow-ups
- Known limitations: text/markdown input only (no PDF/DOCX yet), no UI yet — CLI only, single-transcript context (no cross-meeting memory)

## Currently building

Next build coming soon.

## How it works

File/paste input → bounded reasoning workflow → structured output → human review.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
npm run meeting-action -w @ai-agents-it-services/core -- path/to/transcript.txt
npm run evals:meeting-action -w @ai-agents-it-services/core
npm test -w @ai-agents-it-services/core
```

## Safety & privacy

Synthetic examples only. Uploaded content is treated as untrusted data, never as instructions. High-impact recommendations require human review — nothing is written back to any external system automatically.

## Feedback

Open an issue describing the workflow or problem you'd want covered — please don't include confidential customer data.
