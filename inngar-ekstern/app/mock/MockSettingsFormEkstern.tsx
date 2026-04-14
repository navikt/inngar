import { Button, Select } from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { MockSettings } from "~/mock/mockSettings"
import { useState } from "react"

const kanStarteOppfolgingEksternOptions: MockSettings["kanStarteOppfolgingEkstern"][] =
    [
        "JA",
        "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT",
        "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR",
        "ALLEREDE_UNDER_OPPFOLGING",
        "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT",
        "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT",
        "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR",
        "DOD",
        "IKKE_LOVLIG_OPPHOLD",
        "UKJENT_STATUS_FOLKEREGISTERET",
        "INGEN_STATUS_FOLKEREGISTERET",
        "Error",
    ]

export const MockSettingsFormEkstern = ({
    mockSettings,
}: {
    mockSettings?: MockSettings
}) => {
    console.log(mockSettings)
    const [isOpen, setIsOpen] = useState(false)
    const [kanStarteOppfolgingEkstern, setKanStarteOppfolgingEkstern] =
        useState(mockSettings?.kanStarteOppfolgingEkstern ?? "JA")
    const fetcher = useFetcher()

    if (!isOpen)
        return (
            <Button
                onClick={() => {
                    console.log("isOpen", isOpen)
                    setIsOpen(!isOpen)
                }}
                id={"knapp"}
                className="bg-white p-2 rounded-2xl hover:bg-amber-100 cursor-pointer drop-shadow-2xl absolute bottom-6 right-6"
            >
                Mock settings ekstern
            </Button>
        )

    return (
        <div className="bg-white border rounded-lg drop-shadow-2xl p-4 absolute bottom-6 right-6">
            <div className="flex flex-row-reverse items-start gap-2">
                <Button variant="tertiary" onClick={() => setIsOpen(false)}>
                    ✕
                </Button>
                <Select
                    label="Kan starte oppfølging (ekstern)?"
                    value={kanStarteOppfolgingEkstern}
                    onChange={(event) => {
                        const value =
                            event.target.value as MockSettings["kanStarteOppfolgingEkstern"]
                        setKanStarteOppfolgingEkstern(value)
                        fetcher.submit(
                            { kanStarteOppfolgingEkstern: value },
                            {
                                action: "/mock-settings",
                                method: "POST",
                            },
                        )
                    }}
                >
                    {kanStarteOppfolgingEksternOptions.map((svar) => (
                        <option value={svar} key={svar}>
                            {svar}
                        </option>
                    ))}
                </Select>
            </div>
        </div>
    )
}
