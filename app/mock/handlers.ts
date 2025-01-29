import { http, HttpResponse, ws } from "msw"
import { hentStatusPayload } from "~/mock/mockdata/hent-status"
import { decoratorPayload } from "~/mock/mockdata/decorator"
import { dialogGraphqlPayload } from "~/mock/mockdata/dialogGraphql"
import { hentPersonPayload } from "~/mock/mockdata/hent-person"
import { hentOppfolgingsstatusPayload } from "~/mock/mockdata/hent-oppfolgingsstatus"
import { hentVergeOgFullmaktPayload } from "~/mock/mockdata/hent-vergeOgFullmakt"

const contextHolder = "http://modiacontextholder.personoversikt"
const veilarboppfolging = `http://veilarboppfolging.poao`
const veilarbperson = `http://veilarbperson.obo`
const veilarbportefolje = `http://veilarbportefolje.obo`

export const handlers = [
    http.get(`${contextHolder}/api/context/v2/aktivbruker`, () => {
        return HttpResponse.json({ aktivBruker: "24429106210" })
    }),
    http.post(`${contextHolder}/api/context`, () => {
        return HttpResponse.json({
            aktivBruker: "24429106210",
            aktivEnhet: "0219",
        })
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
    http.post(`${veilarboppfolging}/veilarboppfolging/api/graphql`, ({ cookies }) => {
        // return HttpResponse.text("Not found", { status: 404 })
        return HttpResponse.json({
            data: { oppfolging: { erUnderOppfolging: false}, oppfolgingsEnhet: { enhet: { kilde: "NORG", navn: "NAV Øst", id: "0412" } } },
            error: null,
        })


    }),
]
