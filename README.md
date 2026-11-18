<p align="center">
  <img src="https://i.imgur.com/hkRlTDp.png" alt="FastGem logo" width="320" />
</p>

<h1 align="center">FastGem</h1>

<p align="center">
  <strong>Build and run focused Gemini agents without the framework overhead.</strong><br>
  A lightweight, self-hostable TypeScript and Express runtime with persistent sessions and a React control plane.
</p>

<p align="center">
  <a href="https://github.com/JQCVSC/FastGem"><img src="https://img.shields.io/badge/Runtime-FastGem-blue?logo=github" alt="FastGem runtime"></a>
  <a href="https://github.com/JQCVSC/FastGem-Landing-page"><img src="https://img.shields.io/badge/Website-Agent%20Studio-orange" alt="FastGem website"></a>
  <a href="https://github.com/JQCVSC/FastGem/releases"><img src="https://img.shields.io/badge/status-alpha-yellow" alt="Alpha status"></a>
</p>

FastGem is a Gemini-native agent runtime and control plane. Define agents with their own instructions and model settings, start persistent sessions, run prompts through Google Gemini, and connect another frontend or service through a small HTTP API.

This repository contains the runtime and the React console. The public website and Agent Studio are maintained in the separate [`FastGem-Landing-page`](https://github.com/JQCVSC/FastGem-Landing-page) repository.

## Try FastGem in 60 seconds

FastGem currently runs locally and stores agent/session data in a human-readable JSON file. You need Node.js and a Google Gemini API key.

```bash
git clone https://github.com/JQCVSC/FastGem.git
cd FastGem
npm install
cp .env.example .env
```

Add your key to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
FASTGEM_MODEL=gemini-3.8-flash
FASTGEM_PORT=8000
```

Start the runtime:

```bash
npm run runtime
```

In another terminal, verify it:

```bash
curl http://localhost:8000/health
```

Then run the website from [`FastGem-Landing-page`](https://github.com/JQCVSC/FastGem-Landing-page), set `VITE_FASTGEM_RUNTIME_URL=http://localhost:8000`, open the console, and launch Agent Studio.

Never commit `.env` or expose your Gemini API key.

## Why FastGem?

FastGem focuses on the boundary between an agent definition, a persistent session, and model execution. It is intended for developers who want a small runtime they can inspect, connect to their own interface, and evolve toward a production service.

Compared with a large general-purpose agent framework, FastGem intentionally has fewer abstractions. The current implementation does not pretend to provide production authentication, sandboxed tool execution, multi-user workspaces, or durable cloud storage. Those are explicit roadmap items rather than hidden assumptions.

## Current capabilities

- Direct Google Gemini execution through `@google/genai`.
- Agent records with names, descriptions, system instructions, model settings, and tool metadata.
- Persistent local sessions and conversation history in `.fastgem/data.json`.
- React control plane and Agent Studio integration.
- JSON endpoints for health, agents, sessions, and runs.
- Server-sent event streaming foundation for progressive run output.
- Configurable runtime model, port, data directory, and website origin.

## Architecture

```text
FastGem-Landing-page       FastGem runtime
React website + console  → TypeScript/Express → Google Gemini API
                              ↓
                     local agents and sessions
```

The runtime keeps the first vertical slice intentionally inspectable:

- `server.ts` contains the HTTP server, persistence boundary, and Gemini call path.
- `.fastgem/data.json` stores local agents and sessions during development.
- The website connects through `VITE_FASTGEM_RUNTIME_URL`.

## Runtime API

### Health check

```bash
curl -sS http://localhost:8000/health
```

Example response:

```json
{"ok":true,"service":"fastgem-runtime","model":"gemini-3.8-flash"}
```

### List agents

```bash
curl -sS http://localhost:8000/api/agents
```

The seeded development agent uses the ID `researcher`. You can create another agent with:

```bash
curl -sS -X POST http://localhost:8000/api/agents \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Support Agent",
    "description": "A session-aware product support assistant.",
    "systemInstruction": "Answer clearly and keep responses concise.",
    "model": "gemini-3.8-flash"
  }'
```

### Create a session

```bash
curl -sS -X POST http://localhost:8000/api/agents/researcher/sessions \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### Run a real Gemini prompt

The run endpoint creates a session ID automatically when one is not supplied. This command requires `GEMINI_API_KEY` to be configured in the runtime process:

```bash
curl -sS -X POST http://localhost:8000/api/agents/researcher/runs \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Explain why persistent sessions are useful for Gemini agents. Keep it to three bullet points."
  }'
```

To continue a conversation, pass the returned `sessionId` in another request:

```bash
curl -sS -X POST http://localhost:8000/api/agents/researcher/runs \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId": "ses_replace_with_returned_id",
    "prompt": "Now give one concrete example."
  }'
```

### Streaming run foundation

```text
GET /api/agents/:agentId/runs/stream?prompt=...&sessionId=...
```

The endpoint emits `status`, `token`, `done`, or `error` server-sent events. The current implementation chunks the completed model response for progressive delivery; it is a foundation for richer streaming behavior.

## Website and Agent Studio

Clone the website separately:

```bash
git clone https://github.com/JQCVSC/FastGem-Landing-page.git
cd FastGem-Landing-page
npm install
cp .env.example .env
```

Set the runtime URL in `.env`:

```env
VITE_FASTGEM_RUNTIME_URL=http://localhost:8000
```

Start the website:

```bash
npm run dev
```

Open `http://localhost:3000`, choose **Open Console**, continue through the development preview gate, launch an agent, and submit a prompt in Agent Studio.

The current sign-in screen is a frontend development gate. It does not perform production authentication or Google OAuth.

## Environment variables

| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key used by the backend | — | Yes for runs |
| `FASTGEM_MODEL` | Default Gemini model | `gemini-3.8-flash` | No |
| `FASTGEM_PORT` | Runtime port | `8000` | No |
| `FASTGEM_DATA_DIR` | Directory containing local runtime data | `.fastgem` | No |
| `VITE_FASTGEM_RUNTIME_URL` | Website origin for the separate runtime | `http://localhost:8000` | Website only |

## Current limitations

FastGem is an alpha developer preview. Production deployment requires additional work:

- Production authentication and Google OAuth.
- HTTPS, rate limiting, and secret management.
- Durable database storage and multi-user isolation.
- Secure sandboxed tool execution.
- Multimodal file/context handling.
- Usage, cost, evaluation, and observability features.
- Deployment templates and operational documentation.

The current local JSON store is useful for development and testing. Do not expose the runtime publicly without adding appropriate security and production persistence.

## Roadmap

The roadmap is tracked through GitHub issues and will prioritize the smallest useful steps toward a production-ready Gemini agent platform:

1. Verify and document the end-to-end runtime and Agent Studio path.
2. Improve session and error handling.
3. Add production authentication and workspace boundaries.
4. Replace local JSON persistence with a durable datastore adapter.
5. Add secure tools, evaluations, usage tracking, and deployment templates.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, testing expectations, issue guidance, and pull request conventions.

## License and security

FastGem is distributed under the Source-Available Community License. Review the repository license before using it in a commercial or external deployment.

Do not open an issue containing API keys, credentials, private prompts, or other sensitive data. For security reports, follow the responsible-disclosure instructions in [`SECURITY.md`](SECURITY.md) when that file is added; until then, contact the maintainer privately through GitHub rather than posting secrets publicly.
