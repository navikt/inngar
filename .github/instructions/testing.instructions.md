---
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Testing (inngar)

Inngar bruker **Vitest** med `jsdom`-miljø for enhet- og komponenttester.

## Struktur

```typescript
import { describe, it, expect, vi } from "vitest";

describe("MinKomponent", () => {
  it("rendrer riktig innhold", () => {
    // Arrange
    const input = { name: "Test" };

    // Act
    const result = formatName(input.name);

    // Assert
    expect(result).toBe("Test");
  });

  it("håndterer feiltilfeller", () => {
    expect(() => formatName("")).toThrow("Name cannot be empty");
  });
});
```

## Async

```typescript
it("henter data", async () => {
  const result = await fetchData("test-id");
  expect(result).toBeDefined();
  expect(result.id).toBe("test-id");
});

it("håndterer feil", async () => {
  await expect(fetchData("ugyldig")).rejects.toThrow("Not found");
});
```

## Mocking

```typescript
import { vi } from "vitest";

vi.mock("../server/myService.server", () => ({
  hentData: vi.fn().mockResolvedValue({ id: "1", navn: "Test" }),
}));
```

## Prinsipper
- Test bruker-synlig adferd, ikke implementasjonsdetaljer.
- Dekk både suksess- og feilscenarioer.
- Hold tester deterministiske og raske.
- Plasser tester nær koden de tester (`*.test.ts` ved siden av kildefilen).
