# AGENTS.md — navikt/inngar

## Repository overview

`inngar` is a frontend app for starting arbeidsoppfolging.
Tech stack: React Router 7, React 18, TypeScript, Vite, Express runtime, Aksel.

## Build and verification

```bash
npm run typecheck
npm run build
```

## Team rules for AI agents

### Always
- Follow existing route/module patterns in `app/` and `server/`.
- Prefer Aksel components and existing styling patterns.
- Keep changes small, focused, and type-safe.

### Ask first
- Breaking route changes
- Authentication/NAIS behavior changes
- New runtime dependencies

### Never
- Commit secrets
- Merge PR automatically without explicit approval
