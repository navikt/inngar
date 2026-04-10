---
applyTo: "inngar-*/app/**/*.{ts,tsx}"
---

# Aksel Design System – koderegler

Bruk `@navikt/ds-react` >= v8. Spør `@aksel-agent` for migrering, ukjente komponenter eller Figma-hjelp.

## Spacing – aldri Tailwind

```tsx
// ✅
<Box paddingBlock={{ xs: "space-16", md: "space-24" }} paddingInline="space-16">
<VStack gap="4">   <HStack gap="2" align="center">

// ❌
<div className="p-4">   <Box padding="4">  // mangler space-prefiks
```

Tokens: `space-4` `space-8` `space-12` `space-16` `space-20` `space-24` `space-32` `space-40` `space-48` `space-64`

## Layout og responsivitet (mobil-først)

```tsx
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="4">
<Box background="surface-subtle" borderRadius="large" padding={{ xs: "space-16", md: "space-24" }}>
```

Breakpoints: `xs` 0px · `sm` 480px · `md` 768px · `lg` 1024px · `xl` 1280px

## Typografi og ikoner

```tsx
import { Heading, BodyShort, BodyLong, Label } from "@navikt/ds-react";
import { ChevronRightIcon } from "@navikt/aksel-icons";

<Heading size="large" level="1">   <BodyShort>   <Label>
<ChevronRightIcon title="Gå videre" fontSize="1.5rem" />
```

## Tallformatering

```typescript
// ✅ norsk locale
new Intl.NumberFormat("nb-NO").format(151354); // "151 354"
// ❌ num.toLocaleString() – bruker nettleserens locale
```
