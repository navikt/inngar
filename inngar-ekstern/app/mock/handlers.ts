import { http, HttpResponse } from "msw"
import { mockSettings } from "~/mock/mockSettings"

const veilarboppfolging = `http://veilarboppfolging.poao`
const dekoratoren = `https://dekoratoren.ekstern.dev.nav.no`

export const handlers = [
  http.get(`${dekoratoren}/api/version`, () => {
    return HttpResponse.json({
      name: "dekoratoren-moduler",
      version: "3.6.3",
    })
  }),
  http.post(`${veilarboppfolging}/veilarboppfolging/api/graphql`, async () => {
    if (mockSettings.kanStarteOppfolgingEkstern === "Error") {
      return HttpResponse.json({
        errors: [
          {
            message: "Dette er en mock-feilmelding i graphql reponsen",
          },
        ],
      })
    }

    return HttpResponse.json({
      data: undefined,
      errors: [
        {
          title: "error title",
          message: "LOL asdas",
        },
      ],
    })

    return HttpResponse.json({
      data: {
        oppfolging: {
          kanStarteOppfolgingEkstern: mockSettings.kanStarteOppfolgingEkstern,
        },
      },
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
  http.get("https://login.ekstern.dev.nav.no/oauth2/session", () => {
    return HttpResponse.json({
      session: {
        created_at: "2026-04-14T06:14:27.951879893Z",
        ends_at: "2026-04-14T12:14:27.951879893Z",
        timeout_at: "2026-04-14T07:14:27.951880373Z",
        ends_in_seconds: 20342,
        active: true,
        timeout_in_seconds: 2342,
      },
      tokens: {
        expire_at: "2026-04-14T07:14:27.950953423Z",
        refreshed_at: "2026-04-14T06:14:27.951879893Z",
        expire_in_seconds: 2342,
        next_auto_refresh_in_seconds: -1,
        refresh_cooldown: false,
        refresh_cooldown_seconds: 0,
      },
    })
  }),
]
