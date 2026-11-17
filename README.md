# inngar
App for å starte arbeidsoppfølging

### Forslag: avslutt egen arbeidsrettet oppfølging

Avslutningsflyten ligger i `inngar-ekstern` på `/avslutt-oppfolging`.
Dette er et forslag; teamet har ikke bestemt hvilken app som skal eie flyten.
Personlig hilsen og enkelte informasjonstekster er fortsatt plassholdere.

| Miljø | URL aktivitetsplanen kan lenke til |
| --- | --- |
| Produksjon | `https://start-arbeidsoppfolging.nav.no/avslutt-oppfolging` |
| Dev | `https://start-arbeidsoppfolging.ekstern.dev.nav.no/avslutt-oppfolging` |

Ingen inngangslenke eller Unleash-sjekk er lagt til i Inngar.
Aktivitetsplanen beholder ansvaret for inngangslenken og vilkårene for å vise den.
Tilbake-lenken går til aktivitetsplanen (dev også ved lokal utvikling).
Header og footer kommer fra Inngars eksisterende dekoratør.

Flyten bruker eksisterende OASIS/TokenX-oppsett og tilgang til
`veilarboppfolging`. Server-action sender
`POST /veilarboppfolging/api/v3/oppfolging/avslutt-egen-oppfolging`
med bare `{ "begrunnelse": "..." }`. Innbygger identifiseres fra tokenet.
Bekreftelse og maks 500 tegn valideres både i nettleseren og på serveren.
Kun `204` gir bekreftelse på samme side; `409` og øvrige feil beholder skjemaet.
Det gjøres ingen automatisk retry av den avsluttende POST-en.

#### Tester og avhengigheter

Det er lagt til et avgrenset Vitest-oppsett med Testing Library og MSW.
Testene dekker skjema, servervalidering, request-body, autentiseringsfeil,
HTTP-status, nettverksfeil, fokus, ny innsending etter feil og dobbeltinnsending.

**Gjenstår før forslaget er klart for CI:** Oppdater `bun.lock` med
`bun install` fra repo-roten. Installasjon/kjøring var blokkert i
utviklingsøkten; testene og bygget er derfor ikke kjørt. Eksisterende CI
bruker `--frozen-lockfile` og vil avvise manifestendringen inntil låsefilen
er oppdatert. Testkommandoen er foreløpig ikke koblet inn i deploy-workflowen.

Etter oppdatert låsefil, fra repo-roten:

```sh
bun run --filter inngar-ekstern test
bun run --filter inngar-ekstern typecheck
bun run --workspaces build
```

#### Utrulling, observerbarhet og tilbakerulling

Ikke aktiver inngangslenken før appeierskap og endelige tekster er avklart.
Nais, autentisering, database og deploy-workflower er uendret.
Ved lokal utvikling bruker eksisterende MSW-oppsett et simulert `204`-svar.

Etter eventuell deploy: kontroller direktebesøk med innlogging, tilbake-lenke,
validering, `204` med fokusert bekreftelse, og `409`/feil med bevart skjema.
Bruk bare avtalt testbruker i dev for reelle avslutninger.

Følg eksisterende HTTP-traces og statusfordeling mot endepunktet, særlig
økning i `5xx`/nettverksfeil og `401`/`403`. `409` er en forventet
forretningsavvisning, ikke i seg selv en driftsfeil. Klienten logger kun
teknisk feiltype/status, aldri begrunnelse, token eller backend-responsinnhold.
Begrunnelsen sendes ikke til analytics. Ingen nye målinger eller alarmer
opprettes som del av forslaget.

Frontend kan rulles tilbake med forrige appversjon; inngangslenken kan
deaktiveres i aktivitetsplanen. Dette gjenoppretter **ikke** oppfølging som
allerede er avsluttet i backend.

### Troubleshooting

<details>
  <summary>Error when evaluating SSR module virtual:react-router/server-build: Unexpected token 'export'</summary>
  (node:98469) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
15:43:25 [vite] (ssr) Error when evaluating SSR module virtual:react-router/server-build: Unexpected token 'export'
      at internalCompileFunction (node:internal/vm:73:18)
      at wrapSafe (node:internal/modules/cjs/loader:1153:20)
      at Module._compile (node:internal/modules/cjs/loader:1205:27)
      at Object.Module._extensions..js (node:internal/modules/cjs/loader:1295:10)
      at Module.load (node:internal/modules/cjs/loader:1091:32)
      at Function.Module._load (node:internal/modules/cjs/loader:938:12)
      at cjsLoader (node:internal/modules/esm/translators:284:17)
      at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:234:7)
      at ModuleJob.run (node:internal/modules/esm/module_job:217:25)
      at ModuleLoader.import (node:internal/modules/esm/loader:316:24)
15:43:25 [vite] Internal server error: Unexpected token 'export'
      at internalCompileFunction (node:internal/vm:73:18)
      at wrapSafe (node:internal/modules/cjs/loader:1153:20)
      at Module._compile (node:internal/modules/cjs/loader:1205:27)
      at Object.Module._extensions..js (node:internal/modules/cjs/loader:1295:10)
      at Module.load (node:internal/modules/cjs/loader:1091:32)
      at Function.Module._load (node:internal/modules/cjs/loader:938:12)
      at cjsLoader (node:internal/modules/esm/translators:284:17)
      at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:234:7)
      at ModuleJob.run (node:internal/modules/esm/module_job:217:25)
      at ModuleLoader.import (node:internal/modules/esm/loader:316:24)
</details>

Løsning: Bruk node 22