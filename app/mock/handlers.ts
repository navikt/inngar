import {http, HttpResponse, ws} from "msw";

const urlBase = "http://http:5173"

export const handlers = [
    // Denne må mockes client-side, ikke serverside
    ws.link('wss://modiacontextholder.ansatt.dev.nav.no/ws/:ident').addEventListener('connection', () => {
        console.log("Hei")
    }),
    http.get(`${urlBase}/api/modiacontextholder/api/context/v2/aktivbruker`, () => {
        return HttpResponse.json({"aktivBruker":"24429106210"})
    }),
    http.post(`${urlBase}/api/modiacontextholder/api/context`, () => {
        return HttpResponse.json({"aktivBruker":"24429106210","aktivEnhet":"0219"})
    }),
    http.get(`${urlBase}/api/modiacontextholder/api/decorator`, () => {
        return HttpResponse.json({
            "saksbehandler": {
                "ident": "Z994381",
                "fornavn": "F_994381",
                "etternavn": "E_994381",
                "navn": "F_994381 E_994381"
            },
            "enheter": [
                {
                    "enhetId": "0106",
                    "navn": "Nav Fredrikstad"
                },
                {
                    "enhetId": "0219",
                    "navn": "Nav Bærum"
                },
                {
                    "enhetId": "0315",
                    "navn": "Nav Grünerløkka"
                },
                {
                    "enhetId": "0331",
                    "navn": "Nav Nordre Aker"
                },
                {
                    "enhetId": "0501",
                    "navn": "Nav Lillehammer-Gausdal"
                },
                {
                    "enhetId": "1101",
                    "navn": "Nav Dalane"
                },
                {
                    "enhetId": "1860",
                    "navn": "Nav Lofoten"
                },
                {
                    "enhetId": "4154",
                    "navn": "Nasjonal oppfølgingsenhet"
                },
                {
                    "enhetId": "4714",
                    "navn": "Nav hjelpemiddelsentral Vestland-Førde"
                }
            ],
            "ident": "Z994381",
            "navn": "F_994381 E_994381",
            "fornavn": "F_994381",
            "etternavn": "E_994381"
        })
    })
]