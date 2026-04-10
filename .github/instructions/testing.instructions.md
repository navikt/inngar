---
applyTo: "**/*.test.{ts,tsx}"
---

# Testing (inngar)

Inngar bruker TypeScript og Vitest. Disse prinsippene gjelder uavhengig av testbibliotek.

## Prinsipper

- Test bruker-synlig adferd, ikke implementasjonsdetaljer
- Dekk både suksess- og feilscenarioer
- Hold tester deterministiske og raske
- Plasser tester nær koden de tester (`*.test.ts` ved siden av kildefilen)
- Arrange / Act / Assert – hold strukturen tydelig

## Struktur

```typescript
describe("MinFunksjon", () => {
  it("gjør det forventede", () => {
    // Arrange
    const input = ...;

    // Act
    const result = minFunksjon(input);

    // Assert
    expect(result).toBe(...);
  });

  it("håndterer feiltilfeller", () => {
    expect(() => minFunksjon(ugyldigInput)).toThrow();
  });
});
```

## Async

```typescript
it("henter data", async () => {
  const result = await hentData("id");
  expect(result).toBeDefined();
});

it("håndterer nettverksfeil", async () => {
  await expect(hentData("ugyldig")).rejects.toThrow();
});
```

## Mocking

Mock på lavest mulig nivå. Foretrekk å teste med ekte implementasjoner der det er praktisk.

```typescript
vi.mock("../minModul", () => ({
  hentData: vi.fn().mockResolvedValue({ id: "1" }),
}));
```
