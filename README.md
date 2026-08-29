# AI Agents for IT Services

Practical AI agents for workflows that people in IT-services teams still do manually — delivery, QA, support, PMO. Each one is a bounded job: file/paste input in, an evidence-backed structured result out, a human decides anything consequential. No hidden enterprise integrations required to get value.

**[Run one now →](#-run-locally)**

## 📂 Browse agents

### 📋 Delivery & PM Agents
*Agents for the people running client engagements — status, follow-through, accountability.*

* [📝 Meeting → Action Agent](packages/core/src/agents/meeting-action/) — Turns a transcript into decisions and action items, evidence-backed, never invents an owner or a date
* [🔍 Requirements Gap Agent](packages/core/src/agents/requirements-gap/) — Finds ambiguity, missing acceptance criteria, contradictions and undefined terms in a requirements document before engineering or QA sees it

## 🚧 Currently building

Next build coming soon.

## ⚙️ How it works

File/paste input → bounded reasoning workflow → structured output → human review.

## 🚀 Run locally

```bash
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
npm run meeting-action -w @ai-agents-it-services/core -- path/to/transcript.txt
npm run evals:meeting-action -w @ai-agents-it-services/core
npm run requirements-gap -w @ai-agents-it-services/core -- path/to/requirements.txt
npm run evals:requirements-gap -w @ai-agents-it-services/core
npm test -w @ai-agents-it-services/core
```

## 🛡️ Safety & privacy

Synthetic examples only. Uploaded content is treated as untrusted data, never as instructions. High-impact recommendations require human review — nothing is written back to any external system automatically.

## 💬 Feedback

Open an issue describing the workflow or problem you'd want covered — please don't include confidential customer data.
