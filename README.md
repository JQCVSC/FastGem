<p align="center">
  <img src="https://i.imgur.com/HRHHyIt.jpeg" alt="FastGem Logo" width="180" style="border-radius: 16px;" />
</p>

# 💎 FastGem (FastGemini)

A high-throughput, lightweight AI Agent runtime built natively for Google Gemini.

**Single Binary · Gemini-Native · Multi-Agent · Perfect Recall · Cloud-Ready**

[Quick Start](#-quick-start) • [Architecture](#%EF%B8%8F-architecture) • [Features](#-features) • [Deployment](#-deployment) • [License](#-license)

---

## 🚀 What is FastGem?

FastGem is an **Agent Factory**—it creates, manages, and runs autonomous AI agents. Built exclusively around the Google Gemini ecosystem, FastGem unlocks features that generic wrappers cannot: perfect recall via a 2-million token context window, sub-second latency powered by Flash economics, and native multimodal (vision/audio/code) tool execution.

Each agent possesses its own personality (`SOUL.md`), long-term memory, skills, and tools. FastGem handles the LLM orchestration, strict JSON function calling, Docker sandbox isolation, and session state.

### Install
*(Drops the binary into `~/.local/bin` and adds it to PATH)*

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/fastgem-ai/fastgem/main/install.sh | bash
```

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -Command "iex(New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/fastgem-ai/fastgem/main/install.ps1')"
```

---

## ⚡ Quick Start

### 1. First Run
Initialize the gateway. This opens a setup wizard in your terminal to configure your Google AI Studio API key and spins up your default agent.
```bash
fastgem init
```
*(Runs in foreground; `^C` to stop. Use `fastgem daemon start` to run in the background).*

### 2. The Dashboard
Open `http://localhost:8000` and log in to your visual control panel.
- **Agents:** Create and manage agents, defining their system instructions and tool permissions.
- **Skills:** Install shared tool schemas via ClawHub, GitHub, or write your own Python/Go functions.
- **Models:** Configure Gemini variants (`gemini-3.6-flash` for speed, `gemini-3.1-pro-preview` for deep reasoning).
- **API Keys:** Issue programmatic credentials to trigger agents from external apps.

### 3. Agent Management
Click on any active agent to enter its workspace:
- **Chat:** Talk directly to the agent to debug its tools and logic.
- **Files:** Edit `SOUL.md` (System Instructions), `IDENTITY.md`, and `MEMORY.md`.
- **Channels:** Connect IM bots (Slack, Discord, Telegram) so end-users can interact seamlessly.
- **Sandbox:** Toggle secure Docker isolation for safe code execution (NanoGemini mode).

---

## 🏗️ Architecture

FastGem operates with a streamlined host-and-store architecture.

```text
~/.fastgem/
  fastgem.db                 # SQLite default — users, agents, sessions, api keys
  workspace/                 # Secure mounted volume for agent file I/O
  agents/
    <agentId>/skills/        # Agent-private tools and JSON schemas
```

The database is the source of truth for your configuration. There is no messy `fastgem.json`. Bootstrap settings (ports, API keys, storage) load from `FASTGEM_*` env vars, while user-facing configs are edited through the dashboard.

### Data Storage Matrix

| Data | Belongs to | Backing Store |
| :--- | :--- | :--- |
| **Agent Records & `SOUL.md`** | Agent | DB (`agent_files` table) |
| **Conversation History** | Agent × User | DB (`sessions` table) |
| **API Keys & Configs** | Platform | DB |
| **Skill Functions & Schemas** | Agent / Global | Filesystem (`skills/`) |

---

## ✨ Features

### 🧠 Perfect Recall Memory (The Gemini Advantage)
Say goodbye to complex vector databases and RAG chunking. FastGem utilizes Gemini's massive context window. `MEMORY.md` and full session histories are injected directly into the prompt stream, ensuring the agent never forgets a detail.

### ⚡ Gemini Engine Support
- Native integration with Google AI Studio and Vertex AI endpoints.
- Supports `gemini-3.6-flash`, `gemini-2.5-flash`, `gemini-3.1-pro-preview`, and `gemini-flash-latest`.
- Per-agent model overrides (use Flash for simple webhooks, Pro for complex coding tasks).

### 🛡️ Tools & Secure Sandbox
- **Built-in:** `execute_bash`, `read_file`, `write_file`, `query_firestore`, `fetch_webpage`, `send_slack_message`.
- **Sandboxing:** Opt into secure Docker container execution. Tool calls automatically run inside an isolated Linux sandbox. If an agent runs a destructive command, it only affects the ephemeral container, keeping your host safe.

### 💬 Omnichannel Bindings
Bind Telegram, Discord, and Slack bots per agent. Sessions stay strictly isolated by channel and chat ID. A user's Slack thread will never bleed into their Discord thread.

### 🔌 API-First Design
FastGem exposes a robust API for custom app integration:
- `/api/v1/agent/run` - Core execution endpoint.
- `/api/chat/stream` - SSE streaming for web clients.
- `/api/agents` - Agent CRUD operations.
- `/api/apikeys` - Issue scoped credentials for external services.

---

## ⚙️ Configuration

Bootstrap FastGem entirely via environment variables. Everything else is managed in the UI.

| Env Var | Default | Description |
| :--- | :--- | :--- |
| `FASTGEM_HOME` | `~/.fastgem` | Where the SQLite DB and skill folders live. |
| `FASTGEM_PORT` | `8000` | Gateway HTTP port. |
| `GEMINI_API_KEY` | *empty* | Your Google AI Studio API Key. |
| `FASTGEM_STORAGE_TYPE` | `sqlite` | `sqlite` or `firestore` / `postgres`. |
| `FASTGEM_SANDBOX` | `false` | Set to `true` to force all exec tools into Docker. |

---

## 🚀 Deployment

### Local CLI (Foreground / Background)
```bash
fastgem                  # Run in foreground
fastgem daemon start     # Run in background (logs to ~/.fastgem/daemon.log)
```

### Docker
Ship FastGem as a lightweight container.
```bash
cd deploy/docker && ./start.sh
```

### Serverless (Firebase / Cloud Run)
FastGem can be compiled to run efficiently in serverless environments, utilizing Firestore as the backend state manager for infinite scale.

---

## 💻 CLI Management

Manage your entire fleet without touching the web UI. The CLI writes directly to the FastGem database.

```bash
# Zero to a chattable agent in one command:
fastgem agents init "SupportBot" --model gemini-3.6-flash

# Configure agent rules:
fastgem agents config "SupportBot" set temperature 0.2
fastgem agents config "SupportBot" set sandbox.enabled true

# Upload identity files:
fastgem agents files put "SupportBot" SOUL.md ./my_rules.md

# Teardown:
fastgem agents rm "SupportBot"
```

---

## 📄 License

FastGem is source-available under the **FastGem Community License** (Based on Apache 2.0).

**TL;DR:**
- ✅ Use it commercially as a backend for your own products.
- ✅ Deploy it internally within your organization.
- ❌ Do not host FastGem as a standalone multi-tenant SaaS for unrelated organizations without a commercial license.
- ❌ Do not remove or modify the FastGem branding in the dashboard UI.
