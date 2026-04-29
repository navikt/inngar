---
name: ukentlige-oppdateringer
description: Kjør ukentlige Dependabot-oppdateringer for dette bun/TypeScript-monorepoet og klargjør for merge til main
---

Du er en agent som utfører ukentlige avhengighetsoppdateringer for dette repoet. Dependabot har allerede åpnet PRer — din jobb er å samle dem på én branch, løse eventuelle problemer underveis, og klargjøre for menneskelig gjennomgang og merge.


## Kontekst om repoet

- **Pakkehåndterer**: `bun` (monorepo med workspaces: `common`, `inngar-intern`, `inngar-ekstern`)
- **Tester**: Kjøres fra rotnivå: `bun run test` (eller per workspace)
- **Build**: `bun run build` (eller per workspace)
- **Dependabot**: Konfigurert med `npm`-økosystem (leser `package.json`) — Dependabot har ikke native bun.lock-støtte
- **Viktig**: Etter merge av Dependabot-PRer må du kjøre `bun install` for å oppdatere `bun.lock`
- **CI/CD**: Deploy til dev skjer via `workflow_dispatch` — ikke nødvendig å deploye som en del av dette oppsettet


## Steg 1 — Finn ukenummer og opprett branch

```bash
WEEK=$(date +%V)
YEAR=$(date +%Y)
BRANCH="oppdateringer/uke-${WEEK}-${YEAR}"
git checkout main
git pull origin main
git checkout -b "$BRANCH"
echo "Branch opprettet: $BRANCH"
```


## Steg 2 — Hent og verifiser åpne Dependabot-PRer

```bash
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,labels,author
```

### ⚠️ Sikkerhetssjekk før merge

**Verifiser for hver PR at:**
1. `author.login` er nøyaktig `app/dependabot`
2. Branch-navnet følger mønsteret `dependabot/<ecosystem>/<pakke>`
3. Endringer er begrenset til `package.json`-filer (rot og/eller workspaces) eller workflow-filer
   *(Dependabot oppdaterer ikke `bun.lock` — dette gjøres manuelt i Steg 3)*

```bash
gh pr view <nr> --json author,headRefName,files \
  | jq '{author: .author.login, branch: .headRefName, files: [.files[].path]}'
```

**Ikke merge PRer som:**
- Har en annen avsender enn `app/dependabot`
- Inneholder endringer i andre filer enn `package.json`-filer eller GitHub Actions-filer

### ⚠️ Migreringsguide ved major-versjonshopp — ALLTID før merge

Dersom en PR bumper et rammeverk til en **ny major-versjon**, **hent og les migreringsguiden** før du gjør tilpasninger.

| Rammeverk | Migreringsguide-URL |
|-----------|---------------------|
| React | `https://react.dev/blog` (søk etter «React <NY_MAJOR>») |
| Vite | `https://vitejs.dev/guide/migration` eller `MIGRATION.md` i Vite-repoet |
| Vitest | `https://vitest.dev/guide/migration` |
| TypeScript | `https://www.typescriptlang.org/docs/handbook/release-notes/overview.html` |
| Bun | `https://bun.sh/blog` (søk etter release notes for ny major) |

```bash
# Eksempel Vite 7 migreringsguide:
curl -sL "https://raw.githubusercontent.com/vitejs/vite/main/docs/guide/migration.md" | head -150
```

**Les spesielt etter:** `breaking`, `removed`, `renamed`, `requires`, `peer`, `migration`

### ⚠️ Kjente koblinger i monorepo — sjekk disse

| Pakke som bumpes (major) | Sjekk mot | Hvorfor |
|---|---|---|
| `react` | `react-dom`, `@types/react` i alle workspaces | Alle workspaces må ha identisk React major |
| `vite` | `@vitejs/*`-plugins, `vitest` i alle workspaces | Plugin-API endres mellom Vite major |
| `vitest` | Test-syntaks i alle workspaces | Major kan endre assertion-API |
| `typescript` | TypeScript-features i alle workspaces | Ny major kan innføre stricter type-checking |

### Prioriter sikkerhets-PRer

```bash
gh pr list --author "app/dependabot" --state open --json number,title,labels \
  | jq '.[] | select(.labels[].name | test("security"))'
```

### Sorteringsrekkefølge

| Prioritet | Kategori |
|-----------|----------|
| 1 | GitHub Actions |
| 2 | TypeScript-typer (`@types/*`) |
| 3 | Testverktøy (`vitest`, `@vitest/*`) |
| 4 | Build-verktøy (`vite`, `@vitejs/*`) |
| 5 | Standalone verktøy (`typescript`) |
| 6 | React og rammeverk (`react`, `react-dom`) |
| 7 | Øvrige avhengigheter |


## Steg 3 — Merge PRer

For hver PR i sorteringsrekkefølgen:

```bash
git fetch origin <dependabot-branch>
git merge origin/<dependabot-branch> --no-edit
```

**Etter merge av hver PR (eller gruppe): oppdater `bun.lock`:**

```bash
bun install           # Oppdaterer bun.lock basert på oppdaterte package.json-filer
git add bun.lock
git commit --amend --no-edit   # Inkluder bun.lock i samme commit som versjonsbumpen
```

Kjør deretter tester:

```bash
bun run test
```

### Dersom `package.json` har merge-konflikter

```bash
# Behold høyeste versjon i konflikten, fjern konfliktmarkørene
bun install
bun run test
git add package.json bun.lock
git commit --amend --no-edit
```

### Dersom tester feiler

1. Les testoutputen nøye
2. Sjekk om feilen skyldes en breaking change i den aktuelle pakken
3. Gjør tilpasninger: `git add -A && git commit -m "fix: tilpass kode etter <pakkenavn>-oppdatering"`
4. Hvis feilen krever større refaktorering: reverter pakken og logg i oppsummeringen

### Revertering

```bash
git revert HEAD --no-edit
# Kjør deretter bun install for å synkronisere bun.lock:
bun install
git add bun.lock
git commit -m "chore: synkroniser bun.lock etter revert"
```


## Steg 4 — Push branchen

```bash
git push origin "$BRANCH"
```

Vent til CI-bygget er ferdig og grønt:

```bash
gh run watch $(gh run list --branch "$BRANCH" \
  --json databaseId --jq '.[0].databaseId') --exit-status
```

Hvis CI feiler: analyser feilen, reverter aktuelle merger, og logg i oppsummeringen.
**Ikke lag PR mot main med rødt bygg.**


## Steg 5 — Lag en oppsummerings-PR

```bash
gh pr create \
  --title "Ukentlige oppdateringer uke ${WEEK}" \
  --body "$(cat <<'EOF'
## Ukentlige avhengighetsoppdateringer

Denne PRen samler alle Dependabot-oppdateringer for uken.

### Inkluderte oppdateringer
<!-- Liste over merget PRer med pakkenavn og versjoner -->

### Skippet oppdateringer
<!-- PRer som ikke ble inkludert, med begrunnelse -->

### Kodeendringer utover versjons-bump
<!-- Eventuelle migrasjonstilpasninger -->

### Merknad om bun.lock
`bun.lock` er oppdatert manuelt via `bun install` etter Dependabot-mergene
(Dependabot oppdaterer kun `package.json`, ikke `bun.lock`).

### Verifisering
- [ ] `bun.lock` er oppdatert og committed
- [ ] Tester passerer
- [ ] CI-bygg er grønt
- [ ] Breaking changes er håndtert

Merge til `main` etter godkjenning.
EOF
)" \
  --base main \
  --head "$BRANCH"
```


## Steg 6 — Instruksjon til mennesket

```
✅ Branch klar: oppdateringer/uke-<uke-nr>-<år>

Neste steg:
1. Sjekk at CI-bygget på branchen er grønt (Actions-tab)
2. Gjennomgå PR-en — sjekk spesielt at bun.lock er med
3. Godkjenn og merge PR-en mot main

Merget i denne runden:
<liste over pakker som ble oppdatert>

Skippet (krever manuell gjennomgang):
<liste over pakker som ikke ble inkludert, med begrunnelse>
```


## Feilscenarioer og håndtering

| Scenario | Handling |
|----------|----------|
| `bun.lock` er ikke oppdatert | Kjør `bun install` og commit `bun.lock` |
| Merge-konflikt i `package.json` | Behold høyeste versjon, kjør `bun install` |
| Testfeil pga. breaking change | Tilpass kode, commit — eller reverter og logg |
| Versjonsmismatch mellom workspaces | Sjekk alle `package.json`-filer i `common/`, `inngar-intern/`, `inngar-ekstern/` |
| React major uten matching `react-dom` | Oppdater alle workspaces til identisk React-versjon |
| Dependabot-branch er utdatert | `gh pr comment <nr> --body "@dependabot rebase"` og vent |
