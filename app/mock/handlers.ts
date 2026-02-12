import { delay, http, HttpResponse } from "msw"
import { hentStatusPayload } from "./mockdata/hent-status"
import { decoratorPayload } from "./mockdata/decorator"
import { dialogGraphqlPayload } from "./mockdata/dialogGraphql"
import { hentPersonPayload } from "./mockdata/hent-person"
import { hentOppfolgingsstatusPayload } from "./mockdata/hent-oppfolgingsstatus"
import { hentVergeOgFullmaktPayload } from "./mockdata/hent-vergeOgFullmakt"
import { mockSettings } from "./mockSettings"
import { graphqlMock } from "~/mock/mockdata/graphqlMock"
import { generateFnrCodeUrl, retrieveFnrUrl } from "~/config"

const contextHolder = "http://modiacontextholder.personoversikt"
const veilarboppfolging = `http://veilarboppfolging.poao`
const veilarbperson = `http://veilarbperson.obo`
const veilarbportefolje = `http://veilarbportefolje.obo`
const veilarbveileder = `http://veilarbveileder.obo`
const aoOppfolgingskontor = `http://ao-oppfolgingskontor.dab`
const oboUnleash = `http://obo-unleash.obo`
const veilarbaktivitet = `http://veilarbaktivitet.dab`

const getAktivBrukerMock = () => {
    const over18Mocking = mockSettings.over18
    const aktiveBrukerMocking = mockSettings.aktivBruker
    console.log("Aktiv bruker mocking", aktiveBrukerMocking)
    console.log("over18Mocking", over18Mocking)
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
    http.post(`${retrieveFnrUrl}`, async ({ request }) => {
        const payload = (await request.json()) as { code: string }
        console.log("Mock handler - Retrieving fnr from code", payload)
        const response = {
            fnr: payload.code.split("").reverse().join(""),
        }
        return HttpResponse.json(response)
    }),
    http.post(`${generateFnrCodeUrl}`, async ({ request }) => {
        const payload = (await request.json()) as { fnr: string }
        const response = {
            code: payload.fnr.split("").reverse().join(""),
        }
        return HttpResponse.json(response)
    }),
    http.get(`${contextHolder}/api/context/v2/aktivenhet`, () => {
        return HttpResponse.json({ aktivEnhet: "0219" })
    }),
    http.post(`${contextHolder}/api/context`, async ({ request }) => {
        const payload = (await request.json()) as {
            eventType: "NY_AKTIV_BRUKER" | "NY_AKTIV_ENHET"
            verdi: string
        }

        if (payload.eventType === "NY_AKTIV_BRUKER") {
            mockSettings.fnr = payload.verdi
            if (mockSettings.aktivBruker === "ja") {
                return HttpResponse.json({
                    aktivBruker: payload.verdi,
                    aktivEnhet: "0219",
                })
            } else {
                return HttpResponse.json({
                    aktivBruker: null,
                    aktivEnhet: "0219",
                })
            }
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
        `${veilarbperson}/veilarbperson/api/v3/person/hent-siste-opplysninger-om-arbeidssoeker-med-profilering`,
        () => {
            return new HttpResponse(null, { status: 204 })
        },
    ),
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
            const feilSvar = ["FNR_FINNES_IKKE", "UKJENT_FEIL"]
            const arenaSvar = mockSettings.registrerArenaSvar!!
            return HttpResponse.json(
                {
                    resultat: "Bruker registrert",
                    kode: arenaSvar,
                },
                { status: feilSvar.includes(arenaSvar) ? 409 : 200 },
            )
        },
    ),
    http.post(`${veilarboppfolging}/veilarboppfolging/api/graphql`, () => {
        return graphqlMock(mockSettings)
    }),
    http.get(`${veilarbveileder}/veilarbveileder/api/veileder/me`, () => {
        return HttpResponse.json({
            ident: "Z994381",
            navn: "E_994381, F_994381",
            fornavn: "F_994381",
            etternavn: "E_994381",
        })
    }),
    http.get(
        `${veilarbveileder}/veilarbveileder/api/enhet/:enhetId/veiledere`,
        () => {
            return HttpResponse.json({
                enhet: {
                    enhetId: "0315",
                    navn: "Nav Grünerløkka",
                },
                veilederListe: [
                    {
                        ident: "Z991681",
                        navn: "E_991681, F_991681",
                        fornavn: "F_991681",
                        etternavn: "E_991681",
                    },
                ],
            })
        },
    ),
    http.post(`${aoOppfolgingskontor}/api/finn-kontor`, async () => {
        await delay(1000)
        return HttpResponse.json({
            kontorId: "1234",
            kontorNavn: "Nav Helsfyr",
        })
    }),
    http.post(`${aoOppfolgingskontor}/graphql`, async ({ request }) => {
        const payload = (await request.json()) as {
            query: string
            variables: { identArg: string }
        }

        // Check if it's the alleKontor query
        if (payload.query.includes("alleKontor")) {
            return HttpResponse.json({
                data: {
                    alleKontor: [
                        { kontorId: "0219", kontorNavn: "Nav Oslo" },
                        { kontorId: "1234", kontorNavn: "Nav Helsfyr" },
                        { kontorId: "0315", kontorNavn: "Nav Grünerløkka" },
                        { kontorId: "0118", kontorNavn: "Nav Fredrikstad" },
                        { kontorId: "0604", kontorNavn: "Nav Kongsberg" },
                    ],
                },
            })
        }

        return HttpResponse.json({ data: null })
    }),
    http.get(`${oboUnleash}/api/feature`, () => {
        return HttpResponse.json({
            "veilarbvisittkortfs.vis-ny-inngang-til-arbeidsrettet-oppfolging":
                true,
        })
    }),
    http.get(
        `${veilarbaktivitet}/veilarbaktivitet/api/feature`,
        ({ request }) => {
            const url = new URL(request.url)

            const features: Record<string, boolean> = {
                "inngar.overstyr-kontor":
                    mockSettings.kanOverstyreKontor ?? true,
            }

            return HttpResponse.json(features)
        },
    ),
]
