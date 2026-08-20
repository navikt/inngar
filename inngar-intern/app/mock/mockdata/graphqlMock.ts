import type { MockSettings } from "~/routes/mocksSettings"
import { HttpResponse } from "msw"

const baseGraphqlResponse = {
    errors: [],
    data: {
        oppfolgingsEnhet: {
            enhet: {
                navn: "Nav TestHeim",
                id: "007",
            },
        },
        brukerStatus: {
            arena: {
                inaktivIArena: true,
                inaktiveringsdato: null,
                kanReaktiveres: undefined,
                formidlingsgruppe: "ARBS",
                kvalifiseringsgruppe: "IKVAL",
            },
            manuell: {
                erManuell: false,
            },
            krr: {
                kanVarsles: false,
                reservertIKrr: false,
                registrertIKrr: true,
            },
            erKontorsperret: true,
            veilederTilordning: {
                veilederIdent: "G121212",
            },
        },
        oppfolging: {
            erUnderOppfolging: true,
        },
        utmeldingskandidatTag:
            "ARBEIDSSOKERPERIODE_AVSLUTTET_SVARTE_NEI_I_BEKREFTELSE",
    },
}

export const graphqlMock = (mockSettings: Partial<MockSettings>) => {
    const enhetMocking = mockSettings.oppfolgingsEnhet
    const kanStarteOppfolgingSetting = mockSettings.kanStarteOppfolging
    const oppfolging = {
        kanStarteOppfolging: kanStarteOppfolgingSetting,
    }
    console.log("Mocking enhet", enhetMocking)
    switch (enhetMocking) {
        case "Arena":
            return HttpResponse.json({
                data: {
                    ...baseGraphqlResponse.data,
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
                    ...baseGraphqlResponse.data,
                    oppfolging,
                    oppfolgingsEnhet: { enhet: undefined },
                },
            })
        case "GT_PDL":
            return HttpResponse.json({
                data: {
                    ...baseGraphqlResponse.data,
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
