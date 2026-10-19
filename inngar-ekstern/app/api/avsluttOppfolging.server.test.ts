// @vitest-environment node
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { avsluttEgenOppfolging } from "./avsluttOppfolging.server"
import { logger } from "common"

const endpoint =
  "http://veilarboppfolging.poao/veilarboppfolging/api/v3/oppfolging/avslutt-egen-oppfolging"
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("avslutt-egen-oppfolging API", () => {
  it.each(["", "Min begrunnelse"])(
    "sender bare begrunnelse i autentisert POST og aksepterer 204 (%s)",
    async (begrunnelse) => {
      const requestMottatt = vi.fn()
      server.use(
        http.post(endpoint, async ({ request }) => {
          requestMottatt({
            body: await request.json(),
            authorization: request.headers.get("Authorization"),
            consumer: request.headers.get("Nav-Consumer-Id"),
            contentType: request.headers.get("Content-Type"),
          })
          return new HttpResponse(null, { status: 204 })
        }),
      )
      expect(await avsluttEgenOppfolging("test-token", begrunnelse)).toEqual({
        status: "vellykket",
      })
      expect(requestMottatt).toHaveBeenCalledExactlyOnceWith({
        body: { begrunnelse },
        authorization: "Bearer test-token",
        consumer: "inngar",
        contentType: "application/json",
      })
    },
  )

  it.each([200, 201, 400, 401, 403, 404, 409, 500, 503])(
    "behandler HTTP %s uten å vise eller logge responsinnhold",
    async (status) => {
      const logg = vi.spyOn(logger, "error").mockImplementation(() => {})
      server.use(
        http.post(endpoint, () =>
          HttpResponse.json({ detail: "Sensitiv backend-tekst" }, { status }),
        ),
      )
      expect(
        await avsluttEgenOppfolging("test-token", "Sensitiv begrunnelse"),
      ).toEqual({
        status: status === 409 ? "kanIkkeAvsluttes" : "feilet",
      })
      expect(JSON.stringify(logg.mock.calls)).not.toContain("Sensitiv")
    },
  )

  it("viser generell feil ved nettverksfeil uten å logge begrunnelse", async () => {
    const logg = vi.spyOn(logger, "error").mockImplementation(() => {})
    server.use(http.post(endpoint, () => HttpResponse.error()))
    expect(
      await avsluttEgenOppfolging("test-token", "Sensitiv begrunnelse"),
    ).toEqual({ status: "feilet" })
    expect(JSON.stringify(logg.mock.calls)).not.toContain("Sensitiv")
  })

  it("skjuler ikke programmeringsfeil som nettverksfeil", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Uventet feil"))
    await expect(avsluttEgenOppfolging("test-token", "")).rejects.toThrow(
      "Uventet feil",
    )
  })
})
