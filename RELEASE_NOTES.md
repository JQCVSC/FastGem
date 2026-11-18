# FastGem v0.1.0-alpha

FastGem v0.1.0-alpha is an early developer preview of a Gemini-native agent runtime and React control plane.

## Included

- TypeScript and Express runtime.
- Direct Google Gemini API integration through `@google/genai`.
- Agent configuration with system instructions and model selection.
- Persistent local agents and sessions in `.fastgem/data.json`.
- React console and Agent Studio integration.
- Health, agent, session, run, and streaming HTTP endpoints.
- Local development setup with `.env.example`.

## Known limitations

- Production authentication and Google OAuth are not implemented.
- Local JSON persistence is intended for development and testing.
- Durable production database support is not included.
- Secure sandboxed tool execution is not implemented.
- The streaming endpoint currently chunks a completed response rather than consuming provider tokens incrementally.
- Public deployment requires HTTPS, authentication, rate limiting, secret management, and production persistence.

## Quick start

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY
npm run runtime
curl http://localhost:8000/health
```

Feedback, bug reports, and focused pull requests are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md).
