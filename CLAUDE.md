# daniel-mds-core-learning — Theme project

This repo is a Shopify Online Store 2.0 theme, developed using the Foundry pipeline (BA → Tech Lead → Dev).

## Foundry pipeline
- Specs: `docs/specs/<feature>-spec.md` (BA stage, `/foundry:spec`)
- Plans: `docs/plans/<feature>-plan.md` (Tech Lead stage, `/foundry:plan`)
- QA: `docs/qa/` (Dev stage gate output, `/foundry:qa-gate`)
- Theme index: `.foundry/INDEX.md` (refresh with `/foundry:codebase-index`)

## Conventions
- Data model decisions (setting vs metafield vs metaobject vs tag) follow the storage decision tree in the `foundry-playbook` skill — do not duplicate an existing pattern; check `.foundry/INDEX.md` first.
- All new sections/blocks must pass `.theme-check.yml` linting and the QA gate in `/foundry:qa-gate` before merge.
- Credentials are never committed — see `.env.example` for the required keys; real values live only in each operator's local `.env`.

## Testing
- Playwright config: `playwright.config.ts`, tests under `tests/`, run against `FOUNDRY_PREVIEW_URL`.
