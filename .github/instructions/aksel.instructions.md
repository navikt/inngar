---
applyTo: "app/**/*.{tsx,ts}"
---

# Aksel Design System

Standarder for bruk av Nav Aksel (`@navikt/ds-react` >= v8.x) i inngar (React Router + Vite).

## Spacing-regler

**VIKTIG**: Bruk alltid Nav DS spacing-tokens, aldri Tailwind padding/margin direkte.

### ✅ Riktig

```tsx
import { Box, VStack, HStack, HGrid } from "@navikt/ds-react";

<Box
  paddingBlock={{ xs: "space-16", md: "space-24" }}
  paddingInline={{ xs: "space-16", md: "space-40" }}
>
  {children}
</Box>

<Box
  background="surface-subtle"
  padding={{ xs: "space-12", sm: "space-16", md: "space-24" }}
  borderRadius="large"
>
  <Heading size="large" level="2">Tittel</Heading>
</Box>
```

### ❌ Feil

```tsx
<div className="p-4 md:p-6">   // ❌ Tailwind padding
<div className="mx-4 my-2">    // ❌ Tailwind margin
<Box padding="4">              // ❌ Mangler space-prefiks
```

## Spacing-tokens

Alltid med `space-`-prefiks:

| Token       | Verdi |
|-------------|-------|
| `space-4`   | 4px   |
| `space-8`   | 8px   |
| `space-12`  | 12px  |
| `space-16`  | 16px  |
| `space-20`  | 20px  |
| `space-24`  | 24px  |
| `space-32`  | 32px  |
| `space-40`  | 40px  |
| `space-48`  | 48px  |
| `space-64`  | 64px  |

## Responsiv design

Mobil-først med breakpoints: `xs` (0px) → `sm` (480px) → `md` (768px) → `lg` (1024px) → `xl` (1280px)

```tsx
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="4">
  {items.map(item => <Card key={item.id} {...item} />)}
</HGrid>
```

## Layout-komponenter

```tsx
import { Box, VStack, HStack, HGrid } from "@navikt/ds-react";

// Vertikal stack
<VStack gap="4">
  <Komponent1 />
  <Komponent2 />
</VStack>

// Horisontal stack
<HStack gap="4" align="center">
  <Icon />
  <Label>Tekst</Label>
</HStack>
```

## Typografi

```tsx
import { Heading, BodyShort, BodyLong, Label } from "@navikt/ds-react";

<Heading size="large" level="1">Sidetittel</Heading>
<Heading size="medium" level="2">Seksjonstitel</Heading>
<BodyShort>Kortfattet tekst</BodyShort>
<BodyLong>Lengre tekst med avsnitt</BodyLong>
<Label>Skjemaetikett</Label>
```

## Bakgrunnsfarger

```tsx
<Box background="surface-default">         {/* Hvit */}
<Box background="surface-subtle">           {/* Lys grå */}
<Box background="surface-action-subtle">    {/* Lys blå */}
<Box background="surface-success-subtle">   {/* Lys grønn */}
<Box background="surface-warning-subtle">   {/* Lys oransje */}
<Box background="surface-danger-subtle">    {/* Lys rød */}
```

## Ikoner

```tsx
import { ChevronRightIcon, CheckmarkIcon } from "@navikt/aksel-icons";

<ChevronRightIcon title="Gå videre" fontSize="1.5rem" />
```

## Tallformatering

Bruk alltid norsk locale:

```typescript
// ✅ Riktig
new Intl.NumberFormat("nb-NO").format(151354); // "151 354"

// ❌ Feil — bruker nettleserens locale
num.toLocaleString();
```
