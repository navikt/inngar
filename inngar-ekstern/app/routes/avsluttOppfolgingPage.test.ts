// @vitest-environment node
import { createStaticHandler } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { getOboToken } from "common/server"
import { avsluttEgenOppfolging } from "~/api/avsluttOppfolging.server"
import { action, loader } from "./avsluttOppfolgingPage"

vi.mock("common/server", () => ({ getOboToken: vi.fn() }))
vi.mock("~/api/avsluttOppfolging.server", () => ({
  avsluttEgenOppfolging: vi.fn(),
}))
vi.mock("~/avsluttOppfolging/AvsluttOppfolgingPage", () => ({
  AvsluttOppfolgingPage: () => null,
}))

const handler = createStaticHandler([
  { id: "avslutt", path: "/avslutt-oppfolging", action, loader },
])

async function send(body: FormData) {
  const result = await handler.query(
    new Request("https://inngar.test/avslutt-oppfolging", {
      method: "POST",
      body,
    }),
  )
  if (result instanceof Response) throw new Error("Uventet respons")
  return result
}

function skjema(begrunnelse = "", bekreftet = true) {
  const body = new FormData()
  body.set("begrunnelse", begrunnelse)
  if (bekreftet) body.set("bekreftet", "bekreftet")
  return body
}

beforeEach(() => {
  vi.mocked(getOboToken).mockResolvedValue({ ok: true, token: "test-token" })
  vi.mocked(avsluttEgenOppfolging).mockReset()
  vi.mocked(avsluttEgenOppfolging).mockResolvedValue({ status: "vellykket" })
})

describe("avslutningsrutens server-action", () => {
  it.each(["", "a".repeat(500)])(
    "aksepterer valgfri begrunnelse innenfor grensen",
    async (begrunnelse) => {
      const result = await send(skjema(begrunnelse))
      expect(result.actionData?.avslutt).toEqual({ status: "vellykket" })
      expect(avsluttEgenOppfolging).toHaveBeenCalledExactlyOnceWith(
        "test-token",
        begrunnelse,
      )
    },
  )

  it("avviser manglende bekreftelse på serveren", async () => {
    const result = await send(skjema("", false))
    expect(result.statusCode).toBe(400)
    expect(result.actionData?.avslutt).toMatchObject({
      status: "ugyldig",
      feil: { bekreftet: "Du må bekrefte før du kan avslutte oppfølgingen." },
    })
    expect(avsluttEgenOppfolging).not.toHaveBeenCalled()
  })

  it("avviser over 500 tegn på serveren", async () => {
    const result = await send(skjema("a".repeat(501)))
    expect(result.statusCode).toBe(400)
    expect(result.actionData?.avslutt).toMatchObject({
      status: "ugyldig",
      feil: { begrunnelse: "Du må korte ned teksten til 500 tegn" },
    })
    expect(avsluttEgenOppfolging).not.toHaveBeenCalled()
  })

  it("avviser en fil i stedet for tekst", async () => {
    const body = skjema()
    body.set("begrunnelse", new Blob(["innhold"]), "fil.txt")
    const result = await send(body)
    expect(result.statusCode).toBe(400)
    expect(avsluttEgenOppfolging).not.toHaveBeenCalled()
  })

  it.each([401, 403])(
    "kaller ikke backend ved auth-feil %s",
    async (status) => {
      vi.mocked(getOboToken).mockResolvedValue({
        ok: false,
        errorResponse: new Response(null, { status }),
      })
      const result = await send(skjema())
      expect(result.statusCode).toBe(status)
      expect(result.actionData?.avslutt).toEqual({ status: "feilet" })
      expect(avsluttEgenOppfolging).not.toHaveBeenCalled()
    },
  )

  it("krever autentisering også ved direkte sidebesøk", async () => {
    vi.mocked(getOboToken).mockResolvedValue({
      ok: false,
      errorResponse: new Response(null, { status: 401 }),
    })
    const result = await handler.query(
      new Request("https://inngar.test/avslutt-oppfolging"),
    )
    expect(result).not.toBeInstanceOf(Response)
    if (!(result instanceof Response)) expect(result.statusCode).toBe(401)
  })
})
