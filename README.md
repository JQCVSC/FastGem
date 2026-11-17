<p align="center">
  <img src="https://i.imgur.com/hkRlTDp.png" alt="FastGem Logo" width="320" />
</p>

<h1 align="center">FastGem 💎</h1>

<p align="center">
  <strong>High-Throughput Gemini AI Agent Runtime</strong><br>
  Engine powered natively for Google Gemini 3.6 Flash, Gemini 3.1 Pro, and Flash-Lite.
</p>

<p align="center">
  <a href="https://github.com/JQCVSC/FastGem"><img src="https://img.shields.io/badge/GitHub-JQCVSC%2FFastGem-blue?logo=github" alt="GitHub Repository"></a>
  <a href="https://github.com/JQCVSC/FastGem#license"><img src="https://img.shields.io/badge/License-Community-orange.svg" alt="License"></a>
  <a href="https://pypi.org/project/fastgem"><img src="https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python" alt="Python"></a>
  <a href="https://github.com/JQCVSC/FastGem"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker"></a>
</p>

---

## 🚀 What is FastGem?

**FastGem** is a Gemini-native agent control plane and runtime. The current implementation combines a TypeScript/Express service for agents, sessions, and Gemini runs with a React dashboard for configuring and operating them.

---

## 📁 Workspace Architecture

A standard FastGem agent workspace is structured as follows:

```plaintext
my-agent/
├── SOUL.md              # System Instructions & Agent Persona
├── MEMORY.md            # Long-term persistent facts & state
├── tools/               # Custom Python execution tools
│   ├── web_search.py
│   └── custom_tool.py
└── fastgem.config.json   # Agent runtime configuration
```

---

## ✨ Key Features

- **⚡ Gemini-native execution**: Real model calls through `@google/genai`, agent system instructions, model selection, and persisted sessions.
- **🧠 Long-context foundation**: Agent memory and session persistence are designed for Gemini’s long-context workflows.
- **🔌 Runtime API**: JSON endpoints plus server-sent event streaming for integrating the dashboard or external clients.
- **🛠 Roadmap-led control plane**: Context inspection, multimodal workspaces, safe tools, evaluation, and Cloud Run deployment are being added behind the working runtime slice.

---

## ⚙️ Environment Configuration

| Environment Variable | Description | Default | Required |
| :--- | :--- | :--- | :---: |
| `GEMINI_API_KEY` | Your Google Gemini API Key | — | **Yes** |
| `FASTGEM_MODEL` | Default model (`gemini-3.6-flash`, `gemini-3.1-pro`) | `gemini-3.6-flash` | No |
| `FASTGEM_PORT` | Port for FastGem runtime & channel webhooks | `8000` | No |
| `FASTGEM_LOG_LEVEL` | Logging verbosity level (`DEBUG`, `INFO`, `WARN`) | `INFO` | No |
| `TELEGRAM_BOT_TOKEN` | Token for Telegram Channel Gateway integration | — | No |
| `DISCORD_BOT_TOKEN` | Token for Discord Channel Gateway integration | — | No |

---

## 📦 Quick Start & Installation

### Local development

See [Runtime status](#runtime-status) below for the currently supported setup. PyPI and Docker packaging are planned rather than released artifacts.

---

## 💻 SDK Usage Example

### Python SDK & Channel Gateway

```python
import os
from fastgem import FastGem, FastGemChannel

# 1. Initialize FastGem agent client
client = FastGem(api_key=os.getenv("GEMINI_API_KEY"))

response = client.agent.run(
    agent_id="researcher",
    prompt="Summarize the latest Gemini 3.6 Flash benchmarks",
    model="gemini-3.6-flash"
)
print(response.text)

# 2. Bind Agent to Messaging Channels (Telegram, Discord, Slack)
gateway = FastGemChannel(agent_id="researcher")
gateway.bind_webhook(platform="telegram", bot_token=os.getenv("TELEGRAM_BOT_TOKEN"))
gateway.bind_webhook(platform="discord", bot_token=os.getenv("DISCORD_BOT_TOKEN"))
gateway.listen(port=8000)
```

### TypeScript SDK

```typescript
import { FastGemClient } from '@fastgem/sdk';

const client = new FastGemClient({
  apiKey: process.env.GEMINI_API_KEY,
});

const result = await client.agents.run({
  agentId: 'researcher',
  prompt: 'Analyze high-throughput agent loops',
  model: 'gemini-3.1-pro',
});

console.log(result.response);
```

### cURL / REST API

```bash
curl -X POST https://api.fastgem.ai/v1/agent/run \
  -H "Authorization: Bearer $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize the latest Gemini 3.6 benchmarks",
    "model": "gemini-3.1-pro",
    "tools": ["web_fetch", "memory_search"]
  }'
```

---

## ❓ Frequently Asked Questions (FAQ)

### What is FastGem?
FastGem is a lightweight runtime engineered specifically to deploy and manage high-throughput Google Gemini AI agents.

### How does FastGem compare to generic agent frameworks?
Unlike heavy generic frameworks, FastGem is optimized natively for Gemini's 2M+ token context window, structured JSON outputs, and fast streaming performance.

### Can I host FastGem on my own server?
Yes! FastGem can be self-hosted anywhere using Docker, Python/Node.js, or 1-click cloud deployments on Cloud Run, GCP, AWS, or DigitalOcean.

---

## 📄 License

FastGem is open-source under the **Source-Available Community License**. Free to use, inspect, modify, and self-host for internal and commercial applications.

- **GitHub Repository**: [https://github.com/JQCVSC/FastGem](https://github.com/JQCVSC/FastGem)


## Runtime status

FastGem now includes a working TypeScript/Express runtime behind the React control plane. The first vertical slice provides:

- Persistent local agents and sessions in `.fastgem/data.json`.
- Real Gemini generation through `@google/genai`.
- Agent-specific system instructions and model selection.
- JSON APIs for agents, sessions, and runs.
- Server-sent event streaming at `/api/agents/:agentId/runs/stream`.
- A visible runtime error state in Agent Studio instead of simulated canned replies.

The dashboard is still evolving. Features such as sandboxed tools, multimodal file context, Cloud Run deployment, and production authentication remain roadmap items until their backend implementations land.

### Run locally

```bash
cp .env.example .env
# add GEMINI_API_KEY to .env
npm install
npm run runtime      # terminal 1: http://localhost:8000
npm run dev          # terminal 2: http://localhost:3000
```

Set `VITE_FASTGEM_RUNTIME_URL` if the runtime is hosted on another origin. The runtime intentionally keeps data local for this first slice; do not expose it publicly without adding authentication and a production datastore.

### Runtime API

```text
GET  /health
GET  /api/agents
POST /api/agents
GET  /api/agents/:agentId/sessions
POST /api/agents/:agentId/sessions
POST /api/agents/:agentId/runs
GET  /api/agents/:agentId/runs/stream?prompt=...
```
