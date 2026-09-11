import type { MockSettings } from "~/routes/mocksSettings"
import { HttpResponse } from "msw"

const baseGraphqlResponse = {
    errors: [],
    data: {
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
    const kanStarteOppfolgingSetting = mockSettings.kanStarteOppfolging
    const oppfolging = {
        kanStarteOppfolging: kanStarteOppfolgingSetting,
    }
    return HttpResponse.json({
        data: {
            ...baseGraphqlResponse.data,
            oppfolging
        }
    })
}
