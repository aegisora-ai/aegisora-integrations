# Aegisora Integrations

> Official integrations, adapters, and interoperability contracts for the Aegisora AI security and governance ecosystem.

## Purpose

This repository contains the integration boundary between Aegisora governance and external agent frameworks, model providers, tool protocols, and custom runtimes.

The design principle is simple:

```text
External Agent / Provider
          |
          v
   Integration Adapter
          |
          v
   Aegisora Contract
          |
          v
 Governance Decision
   |       |       |
 ALLOW   BLOCK  ESCALATE
```

## Integration matrix

| Integration | Status |
| --- | --- |
| OpenAI | Foundation |
| Anthropic | Foundation |
| Google | Foundation |
| Groq | Foundation |
| Qwen | Foundation |
| LangChain | Foundation |
| LangGraph | Foundation |
| MCP | Foundation |
| Custom | Reference adapter |

## Architecture

- `src/contracts/` — stable integration contracts
- `src/adapters/` — provider/framework adapters
- `tests/` — contract and adapter verification
- `.github/workflows/` — continuous verification

## Development

```bash
pnpm install
pnpm verify
```

## Repository boundaries

The examples repository contains runnable examples.

The docs repository contains integration documentation and API references.

This repository contains reusable integration contracts and adapters.

The core repository contains the runtime, security, policy, SDK, audit, and execution layers.

## License

MIT
