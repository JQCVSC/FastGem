# Contributing to FastGem

Thanks for helping improve FastGem. The project is an early Gemini-native runtime and React control plane, so small, focused contributions are especially useful.

## Before you start

Please read the main [`README.md`](README.md) and check open issues before starting work. For larger changes, open an issue first so the design can be discussed before implementation.

Do not include API keys, private prompts, customer data, or other secrets in issues, pull requests, screenshots, logs, or commits.

## Local setup

```bash
git clone https://github.com/JQCVSC/FastGem.git
cd FastGem
npm install
cp .env.example .env
# Add GEMINI_API_KEY only if you need to run a real model request
```

The runtime starts on port `8000` by default:

```bash
npm run runtime
```

The React console starts on port `3000`:

```bash
npm run dev
```

Set `VITE_FASTGEM_RUNTIME_URL=http://localhost:8000` when the website is running separately from the runtime.

## Validation

Run the TypeScript check and production build before opening a pull request:

```bash
npm run lint
npm run build
```

If your change affects runtime behavior, also verify:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/agents
```

Changes to Gemini execution or Agent Studio should include a description of how the real API path was tested. Never commit a real `.env` file.

## Pull requests

Keep pull requests focused and explain:

- What changed and why.
- Which repository or API surface is affected.
- How the change was tested.
- Any limitations or follow-up work.

Prefer small commits and avoid unrelated formatting changes. Update the README or API examples when behavior changes.

## Issues

Use a clear title and include reproduction steps, expected behavior, actual behavior, and relevant logs with secrets removed. Feature requests should explain the user problem and why it belongs in the FastGem runtime rather than the website-only repository.

Good starter areas include API examples, session handling, error states, tests, documentation, and deployment notes. Look for issues labeled `good first issue`.

## Design principles

FastGem currently favors:

- A small, inspectable runtime boundary.
- Explicit limitations instead of unsupported product claims.
- TypeScript types for API contracts.
- Local-first development with a clear path to production adapters.
- Secure defaults and no secrets in source control.
