import { ToggleGroup } from "@navikt/ds-react";
import { useFetcher } from "react-router";
import type { MockSettings } from "~/routes/mocksSettings";

export const MockSettingsForm = ({ mockSettings }: { mockSettings?: MockSettings }) => {
  const fetcher = useFetcher()

  const oppfolgingsEnhet = mockSettings?.oppfolgingsEnhet || "Ingen"
  const over18 = mockSettings?.over18 || "Over18"

  return <div className="bg-white border rounded-lg drop-shadow-2xl p-2 absolute bottom-6 right-6">
    <div className="flex flex-col items-start space-y-2">
      <div className="flex items-center space-x-2">
        <p>Over 18:</p>
        <ToggleGroup defaultValue={over18} onChange={(value) => {
          fetcher.submit({ oppfolgingsEnhet, over18: value }, { action: "/mock-settings", method: "POST" })
        }}>
          <ToggleGroup.Item value="Over18">Over 18</ToggleGroup.Item>
          <ToggleGroup.Item value="Under18">Under 18</ToggleGroup.Item>
        </ToggleGroup>
      </div>
      <div className="flex items-center space-x-2">
        <p>Oppfølgingsenhet:</p>
        <ToggleGroup defaultValue={oppfolgingsEnhet} onChange={(value) => {
          fetcher.submit({ oppfolgingsEnhet: value, over18 }, { action: "/mock-settings", method: "POST" })
        }}>
          <ToggleGroup.Item value="UnderOppfolging">Under oppfølging</ToggleGroup.Item>
          <ToggleGroup.Item value="Arena">Arena</ToggleGroup.Item>
          <ToggleGroup.Item value="GT_PDL">GT PDL</ToggleGroup.Item>
          <ToggleGroup.Item value="Ingen">Ingen</ToggleGroup.Item>
          <ToggleGroup.Item value="Error">Error</ToggleGroup.Item>
        </ToggleGroup>
      </div>
    </div>
  </div>
}