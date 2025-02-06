import { Select, ToggleGroup } from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { MockSettings } from "~/routes/mocksSettings"

const registrerArenaSvarVerdier = [
    "OK_REGISTRERT_I_ARENA",
    "FNR_FINNES_IKKE",
    "KAN_REAKTIVERES_FORENKLET",
    "BRUKER_ALLEREDE_ARBS",
    "BRUKER_ALLEREDE_IARBS",
    "UKJENT_FEIL",
]

export const MockSettingsForm = ({
    mockSettings,
}: {
    mockSettings?: MockSettings
}) => {
    const fetcher = useFetcher()

    const oppfolgingsEnhet = mockSettings?.oppfolgingsEnhet || "Ingen"
    const over18 = mockSettings?.over18 || "Over18"
    const aktivBruker = mockSettings?.aktivBruker || "ja"
    const registrerArenaSvar =
        mockSettings?.registrerArenaSvar || "OK_REGISTRERT_I_ARENA"

    return (
        <div className="bg-white border rounded-lg drop-shadow-2xl p-2 absolute bottom-6 right-6">
            <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center space-x-2">
                    <p>Aktiv bruker:</p>
                    <ToggleGroup
                        defaultValue={aktivBruker}
                        onChange={(value) => {
                            fetcher.submit(
                                {
                                    ...mockSettings,
                                    aktivBruker: value,
                                },
                                { action: "/mock-settings", method: "POST" },
                            )
                        }}
                    >
                        <ToggleGroup.Item value="ja">Ja</ToggleGroup.Item>
                        <ToggleGroup.Item value="nei">Nei</ToggleGroup.Item>
                    </ToggleGroup>
                </div>
                <div className="flex items-center space-x-2">
                    <p>Over 18:</p>
                    <ToggleGroup
                        defaultValue={over18}
                        onChange={(value) => {
                            fetcher.submit(
                                {
                                    ...mockSettings,
                                    over18: value,
                                },
                                { action: "/mock-settings", method: "POST" },
                            )
                        }}
                    >
                        <ToggleGroup.Item value="Over18">
                            Over 18
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="Under18">
                            Under 18
                        </ToggleGroup.Item>
                    </ToggleGroup>
                </div>
                <div className="flex items-center space-x-2">
                    <p>Oppfølgingsenhet:</p>
                    <ToggleGroup
                        defaultValue={oppfolgingsEnhet}
                        onChange={(value) => {
                            fetcher.submit(
                                {
                                    ...mockSettings,
                                    oppfolgingsEnhet: value,
                                },
                                { action: "/mock-settings", method: "POST" },
                            )
                        }}
                    >
                        <ToggleGroup.Item value="UnderOppfolging">
                            Under oppfølging
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="Arena">Arena</ToggleGroup.Item>
                        <ToggleGroup.Item value="GT_PDL">
                            GT PDL
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="Ingen">Ingen</ToggleGroup.Item>
                        <ToggleGroup.Item value="Error">Error</ToggleGroup.Item>
                    </ToggleGroup>
                </div>
                <div className="flex items-center space-x-2">
                    <p>Arena respons:</p>
                    <Select
                        label="Arena respons"
                        defaultValue={registrerArenaSvar}
                        onChange={(event) => {
                            fetcher.submit(
                                {
                                    ...mockSettings,
                                    registrerArenaSvar: event.target.value,
                                },
                                { action: "/mock-settings", method: "POST" },
                            )
                        }}
                    >
                        {registrerArenaSvarVerdier.map((svar) => (
                            <option value={svar} key={svar}>
                                {svar}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    )
}
