import type { MockSettings } from "~/routes/mocksSettings"
import { HttpResponse } from "msw"

export const graphqlMock = (mockSettings: Partial<MockSettings>) => {
    const enhetMocking = mockSettings.oppfolgingsEnhet
    const kanStarteOppfolgingSetting = mockSettings.kanStarteOppfolging
    const oppfolging = {
        kanStarteOppfolging: kanStarteOppfolgingSetting,
    }
    switch (enhetMocking) {
        case "Arena":
            return HttpResponse.json({
                data: {
                    oppfolging,
                    oppfolgingsEnhet: {
                        enhet: {
                            kilde: "ARENA",
                            navn: "NAV Vest",
                            id: "0420",
                        },
                    },
                },
            })
        case "Ingen":
            return HttpResponse.json({
                data: {
                    oppfolging,
                    oppfolgingsEnhet: { enhet: undefined },
                },
            })
        case "GT_PDL":
            return HttpResponse.json({
                data: {
                    oppfolging,
                    oppfolgingsEnhet: {
                        enhet: {
                            kilde: "NORG",
                            navn: "NAV Øst",
                            id: "0412",
                        },
                    },
                },
            })
        case "Error":
            return HttpResponse.json({
                errors: [
                    {
                        message:
                            "Dette er en mock-feilmelding i graphql reponsen",
                    },
                ],
            })
    }
}
