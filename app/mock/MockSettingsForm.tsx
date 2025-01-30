import { ToggleGroup } from "@navikt/ds-react";
import { useFetcher } from "react-router";
import type { MockSettings } from "~/routes/mocksSettings";

export const MockSettingsForm = ({ mockSettings }: { mockSettings?: MockSettings }) => {
  const fetcher = useFetcher()

  const oppfolgingsEnhet = mockSettings?.oppfolgingsEnhet || "Ingen"

  return <div className="bg-white border rounded-lg drop-shadow-2xl p-2 absolute bottom-6 right-6">
    <div className="flex space-x-2 items-center">
      <p>Oppfølgingsenhet:</p>
      <ToggleGroup defaultValue={oppfolgingsEnhet} onChange={(value) => {
        fetcher.submit({ oppfolgingsEnhet: value }, { action: "/mock-settings", method: "POST" })
      }}>
        <ToggleGroup.Item value="UnderOppfolging">Under oppfølging</ToggleGroup.Item>
        <ToggleGroup.Item value="Arena">Arena</ToggleGroup.Item>
        <ToggleGroup.Item value="GT_PDL">GT PDL</ToggleGroup.Item>
        <ToggleGroup.Item value="Ingen">Ingen</ToggleGroup.Item>
        <ToggleGroup.Item value="Error">Error</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  </div>
}