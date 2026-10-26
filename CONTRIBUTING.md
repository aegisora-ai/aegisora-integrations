# Contributing to Aegisora Integrations

Thank you for helping improve Aegisora.

This repository contains reusable contracts and adapters for AI providers, agent frameworks, and tool protocols.

## Repository map

- Core runtime: https://github.com/aegisora-ai/aegisora
- Integrations: this repository
- Runnable examples: https://github.com/aegisora-ai/aegisora-examples
- Documentation: https://docs.aegisora.org/

## Requirements

- Node.js 24
- pnpm 11.20.0
- Git

## Quick start

```bash
git clone https://github.com/aegisora-ai/aegisora-integrations.git
cd aegisora-integrations
pnpm install --frozen-lockfile
```

## Verify changes

Run the relevant build, typecheck, and tests. The workspace build may generate declaration files consumed by other packages.

```bash
pnpm build
pnpm typecheck
pnpm test
```

Report the commands you actually ran and their results. Never claim a test passed if it did not run successfully.

## Good first contributions

- Add adapter tests and edge cases.
- Improve provider or framework compatibility.
- Fix types and contract validation.
- Add reproducible integration examples.
- Improve documentation and troubleshooting.

## Pull request workflow

1. Fork the repository.
2. Create a branch for one focused change.
3. Add or update tests and documentation.
4. Report verification results and known limitations.
5. Open a pull request for review.

## Security

- Never commit credentials, tokens, or private environment files.
- Do not use production credentials or customer data in tests.
- Test only systems you own or are authorized to test.
- Report sensitive vulnerabilities through the core repository security process, not in public exploit details.

## Community

Discord: https://discord.gg/8CM3PpQRT5
