import { http, HttpResponse } from "msw"

const veilarboppfolging = `http://veilarboppfolging.poao`
const dekoratoren = `https://dekoratoren.ekstern.dev.nav.no`

export const handlers = [
    http.get(`${dekoratoren}/api/version`, () => {
        return HttpResponse.json({
            name: "dekoratoren-moduler",
            version: "3.6.3",
        })
    }),
    http.post(
        `${veilarboppfolging}/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode`,
        async ({ request }) => {
            const body = await request.json()
            console.log("Mock: startOppfolgingsperiode called with:", body)

            return HttpResponse.json({
                resultat: "Bruker registrert",
                kode: "OK_REGISTRERT_I_ARENA",
            })
        },
    ),
]
