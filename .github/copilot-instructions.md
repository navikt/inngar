# Copilot instructions for inngar

Inngar er et monorepo med bun workspaces (`common`, `inngar-intern`, `inngar-ekstern`) som bruker React Router v7 og Aksel Design System.

## Struktur og mønstre
- Følg eksisterende mønstre i `inngar-intern/app/` og `inngar-ekstern/app/` før du innfører nye abstraksjoner.
- Delt kode hører hjemme i `common/` – legg til her dersom noe kan gjenbrukes mellom de to appene.
- Route-logikk holdes nær route-filene; unngå unødvendig global state.
- Filer som slutter på `.server.ts` er server-only og fjernes automatisk fra klient-bundles i routes.

## TypeScript
- Hold TypeScript strict; unngå `any` med mindre det er absolutt nødvendig.
- Kjør `bun run --workspaces typecheck` for å verifisere typer på tvers av alle pakker.

## Aksel
- Bruk `@navikt/ds-react`-komponenter og spacing-tokens fremfor ad-hoc UI.
- Se `.github/instructions/aksel.instructions.md` for detaljer om spacing og komponenter.

## Bygging og kjøring
- Bygg alle pakker: `bun run --workspaces build`
- Dev-server inngar-intern: `cd inngar-intern && bun run dev`
- Dev-server inngar-ekstern: `cd inngar-ekstern && bun run dev`

## Auth
- `inngar-ekstern` bruker ID-porten via OASIS (`@navikt/oasis`).
- `inngar-intern` bruker EntraAD via OASIS.
- Endre aldri auth-flyt uten eksplisitt forespørsel.

## Bevaring av kontrakter
- Bevar route-oppførsel og API-kontrakter med mindre du eksplisitt blir bedt om å endre dem.
