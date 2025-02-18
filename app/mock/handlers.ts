import { http, HttpResponse } from "msw"
import { hentStatusPayload } from "./mockdata/hent-status"
import { decoratorPayload } from "./mockdata/decorator"
import { dialogGraphqlPayload } from "./mockdata/dialogGraphql"
import { hentPersonPayload } from "./mockdata/hent-person"
import { hentOppfolgingsstatusPayload } from "./mockdata/hent-oppfolgingsstatus"
import { hentVergeOgFullmaktPayload } from "./mockdata/hent-vergeOgFullmakt"
import { mockSettings } from "./mockSettings"
import { graphqlMock } from "~/mock/mockdata/graphqlMock"

const contextHolder = "http://modiacontextholder.personoversikt"
const veilarboppfolging = `http://veilarboppfolging.poao`
const veilarbperson = `http://veilarbperson.obo`
const veilarbportefolje = `http://veilarbportefolje.obo`

const getAktivBrukerMock = () => {
    const over18Mocking = mockSettings.over18
    const aktiveBrukerMocking = mockSettings.aktivBruker
    if (aktiveBrukerMocking === "ja") {
        if (over18Mocking === "Over18") {
            return HttpResponse.json({
                aktivBruker: mockSettings.fnr,
            })
        } else {
            return HttpResponse.json({ aktivBruker: "01011110523" })
        }
    } else {
        return HttpResponse.json({ aktivBruker: null })
    }
}

export const handlers = [
    http.get(`${contextHolder}/api/context/v2/aktivbruker`, () => {
        return getAktivBrukerMock()
    }),
    http.get(`${contextHolder}/api/context/aktivbruker`, () => {
        return getAktivBrukerMock()
    }),
    http.delete(`${contextHolder}/api/context/aktivbruker`, () => {
        mockSettings.fnr = null
        return HttpResponse.json({
            aktivBruker: "24429106210",
            aktivEnhet: "0219",
        })
    }),
    http.post(`${contextHolder}/api/context`, async ({ request }) => {
        const fnr = (
            (await request.json()) as {
                eventType: "NY_AKTIV_BRUKER" | "??"
                verdi: string
            }
        ).verdi
        mockSettings.fnr = fnr
        if (mockSettings.aktivBruker === "ja") {
            return HttpResponse.json({
                aktivBruker: fnr,
                aktivEnhet: "0219",
            })
        } else {
            return HttpResponse.json({
                aktivBruker: null,
                aktivEnhet: "0219",
            })
        }
    }),
    http.get(`${contextHolder}/api/decorator`, () => {
        return HttpResponse.json(decoratorPayload)
    }),
    http.post("http://veilarbdialog.dab/veilarbdialog/graphql", () => {
        return HttpResponse.json(dialogGraphqlPayload)
    }),
    http.post(
        `${veilarboppfolging}/veilarboppfolging/api/v3/oppfolging/hent-status`,
        () => {
            return HttpResponse.json(hentStatusPayload)
        },
    ),
    http.post(`${veilarbperson}/veilarbperson/api/v3/hent-person`, () => {
        return HttpResponse.json(hentPersonPayload)
    }),
    http.post(
        `${veilarboppfolging}/veilarboppfolging/api/v2/person/hent-oppfolgingsstatus`,
        () => {
            return HttpResponse.json(hentOppfolgingsstatusPayload)
        },
    ),
    http.post(
        `${veilarbperson}/veilarbperson/api/v3/person/hent-vergeOgFullmakt`,
        () => {
            return HttpResponse.json(hentVergeOgFullmaktPayload)
        },
    ),
    http.post(
        `${veilarbperson}/veilarbperson/api/v3/person/hent-fullmakt`,
        () => {
            return new Response(undefined, { status: 204 })
        },
    ),
    http.post(`${veilarbperson}/veilarbperson/api/v3/person/hent-tolk`, () => {
        return new Response(undefined, { status: 204 })
    }),
    http.post(
        `${veilarboppfolging}/veilarboppfolging/api/v3/oppfolging/hent-veilederTilgang`,
        () => {
            return HttpResponse.json({ tilgangTilBrukersKontor: false })
        },
    ),
    http.post(
        `${veilarbportefolje}/veilarbportefolje/api/v1/hent-er-bruker-ufordelt`,
        () => {
            return HttpResponse.text("false")
        },
    ),
    http.post(
        `${veilarboppfolging}/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode`,
        () => {
            const arenaSvar = mockSettings.registrerArenaSvar
            return HttpResponse.json(
                {
                    resultat: "Bruker registrert",
                    kode: arenaSvar,
                },
                { status: 200 },
            )
        },
    ),
    http.post(`${veilarboppfolging}/veilarboppfolging/api/graphql`, () => {
        return graphqlMock(mockSettings)
    }),
]
