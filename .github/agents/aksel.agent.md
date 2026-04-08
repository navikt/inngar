---
name: aksel-agent
description: Interaktiv hjelp for Nav Aksel – migrering, ukjente komponenter og Figma-design
tools:
  - read
  - edit
  - search
  - web
  - execute
---

# Aksel Design Agent

Bruk `@aksel-agent` når du trenger mer enn de automatiske kodereglene: migrering fra eldre versjoner, å finne riktig komponent for et Figma-design, eller dypere veiledning om Aksel-API-et.

Se `.github/instructions/aksel.instructions.md` for de daglige kodereglene (spacing, tokens, layout).

## Pakker i inngar

```
@navikt/ds-react      – React-komponenter
@navikt/ds-css        – Styling
@navikt/ds-tailwind   – Tailwind-integrasjon
@navikt/aksel-icons   – Ikoner
```

## Hva denne agenten kan hjelpe med

### Finne riktig komponent

Søk i Aksel-dokumentasjonen og kildekoden for å finne riktig komponent for et gitt behov. Sjekk alltid `@navikt/ds-react` før du vurderer egne implementasjoner.

Nyttig søk:
```bash
grep -r "from \"@navikt/ds-react\"" app/ | grep -o '"[A-Z][a-zA-Z]*"' | sort -u
```

### Migrering v7 → v8 (spacing-tokens)

```bash
npx @navikt/aksel codemod v8-primitive-spacing  # React-primitiver (Box, Stack osv.)
npx @navikt/aksel codemod v8-token-spacing       # CSS/SCSS/Less/Tailwind
```

| Gammelt (v7) | Nytt (v8)   | Verdi |
|--------------|-------------|-------|
| `spacing-4`  | `space-16`  | 16px  |
| `spacing-8`  | `space-32`  | 32px  |
| `spacing-12` | `space-48`  | 48px  |
| `spacing-16` | `space-64`  | 64px  |

### Sjekke Tailwind-konflikter

```bash
grep -rE "p-[0-9]|m-[0-9]|px-|py-|pt-|pb-|pl-|pr-" app/ --include="*.tsx"
```

### Figma

Bruk Figma MCP-verktøy (hvis tilgjengelig) for å hente design-kontekst og mappe til Aksel-komponenter. Start alltid med å identifisere komponentnavnet i Figma – det samsvarer som regel direkte med `@navikt/ds-react`-eksporten.

## Bakgrunns-tokens (referanse)

```
surface-default | surface-subtle | surface-action-subtle
surface-success-subtle | surface-warning-subtle | surface-danger-subtle
```

## Alle spacing-tokens

`space-0` `space-1` `space-2` `space-4` `space-6` `space-8` `space-12` `space-16` `space-20` `space-24` `space-28` `space-32` `space-36` `space-40` `space-48` `space-56` `space-64` `space-72` `space-80` `space-96` `space-128`
