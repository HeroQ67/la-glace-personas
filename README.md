# LA GLACE Persona App

Two-mode virtual customer simulator for the Thai underground-beauty brand **LA GLACE**.

## Modes

### 💬 Persona Chat
Chat with 4 simulated customers (high-school student, university student, early-career worker, freelance creator). Runs **offline** via a rule-based analyzer — no API key needed.

### 📊 Survey & Predict
Virtual market-research panel of **32 personas across 4 segments** (Strategic Pro 25% · Influencer 25% · Status Seeker 30% · Balanced Lifestyle 20%). Ask any question and get back a probability-weighted distribution + per-segment breakdown + AI-generated insight.

- Calibrated against actual customer research (TikTok Shop ~82% share, Storytelling 100% drive, Ph Blush as hero product, etc.)
- Optional **Claude API** mode for AI-powered panel responses
- Falls back to rule-based simulation when no API key
- Editable "Current Beauty Trends" — keeps personas reasoning against today's market context

## Try it

Open `index.html` directly in any modern browser. No build step. All state lives in `localStorage`.

To use AI mode, paste a Claude API key in the Survey-mode sidebar settings.

## Files

- `index.html` — UI + mode switcher
- `personas.js` — 4 chat personas
- `analyzer.js` — offline rule-based response engine for chat
- `survey-personas.js` — 32-persona survey panel + research priors
- `survey.js` — Claude API client + survey aggregation logic
