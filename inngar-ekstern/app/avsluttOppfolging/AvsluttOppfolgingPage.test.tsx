import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it, vi } from "vitest"
import { AvsluttOppfolgingPage } from "./AvsluttOppfolgingPage"
import type { AvsluttOppfolgingResultat } from "./skjema"

const overskrift = "Avslutt arbeidsrettet oppfølging"
const suksess = "Avslutningen av arbeidsrettet oppfølging var vellykket."
const arsakLegend =
  "Velg årsak til at du ikke lenger ønsker arbeidsrettet oppfølging"
const generellFeil =
  "Noe gikk galt, og oppfølgingen ble ikke avsluttet. Prøv igjen senere."

function renderSkjema(
  resultat: () => Promise<AvsluttOppfolgingResultat> = async () => ({
    status: "vellykket",
  }),
) {
  const motta = vi.fn(async ({ request }: { request: Request }) => {
    const body = await request.formData()
    return body
  })
  const action = vi.fn(async ({ request }: { request: Request }) => {
    await motta({ request })
    return resultat()
  })
  const router = createMemoryRouter(
    [
      {
        path: "/avslutt-oppfolging",
        Component: AvsluttOppfolgingPage,
        action,
      },
    ],
    { initialEntries: ["/avslutt-oppfolging"] },
  )
  const view = render(<RouterProvider router={router} />)
  return { ...view, user: userEvent.setup(), action, motta }
}

describe("avslutt egen oppfølging", () => {
  it("krever bekreftelse og flytter fokus uten å sende skjemaet", async () => {
    const { user, action } = renderSkjema()
    await user.click(screen.getByRole("button", { name: overskrift }))
    expect(
      screen.getByText("Du må bekrefte før du kan avslutte oppfølgingen."),
    ).toBeInTheDocument()
    expect(screen.getByRole("checkbox")).toHaveFocus()
    expect(action).not.toHaveBeenCalled()
  })

  it("krever valgt avslutningsårsak for at skjema skal sendes", async () => {
    const { user, action } = renderSkjema()
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: overskrift }))
    expect(screen.getByText("Du må velge en årsak.")).toBeInTheDocument()
    expect(
      screen.getByRole("radiogroup", { name: arsakLegend }),
    ).toBeInTheDocument()
    expect(action).not.toHaveBeenCalled()
  })

  it.each([
    ["I jobb", "IJOBB"],
    ["Alderspensjon", "ALDERSPENSJON"],
    ["Uførertrygd", "UFØRERTRYGD"],
    ["Foreldrepermisjon", "FORELDREPERMISJON"],
    ["Studier", "STUDIER"],
    ["Annet", "ANNET"],
  ])(
    "erstatter innholdet med bekreftelse og sender valgt årsak (%s)",
    async (etikett, begrunnelse) => {
      const { user, motta, container } = renderSkjema()
      const piktogram = container.querySelector("main > svg")
      await user.click(screen.getByRole("radio", { name: etikett }))
      await user.click(screen.getByRole("checkbox"))
      await user.click(screen.getByRole("button", { name: overskrift }))
      const bekreftelse = await screen.findByText(suksess)
      await waitFor(() =>
        expect(bekreftelse.closest("[tabindex]")).toHaveFocus(),
      )
      expect(motta).toHaveBeenCalledTimes(1)
      const body = await motta.mock.results[0].value
      expect(Object.fromEntries(body)).toEqual({
        bekreftet: "bekreftet",
        begrunnelse,
      })
      // Sjekker om AvsluttOppgfolgingPage komponenten er fjernet fra DOM og erstattet med bekreftelse
      expect(screen.queryByRole("radio")).not.toBeInTheDocument()
      expect(screen.queryByText("Hei!")).not.toBeInTheDocument()
      expect(
        screen.queryByRole("link", { name: "Tilbake" }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "Gå til Min side" }),
      ).toHaveAttribute("href", "https://www.ansatt.dev.nav.no/minside")
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        overskrift,
      )
      expect(container.querySelector("main > svg")).toBe(piktogram)
    },
  )

  it.each([
    ["kanIkkeAvsluttes", "Oppfølgingen kan ikke avsluttes nå."],
    ["feilet", generellFeil],
  ] as const)(
    "beholder skjema og fokuserer feilen ved %s",
    async (status, tekst) => {
      const { user } = renderSkjema(async () => ({ status }))
      await user.click(screen.getByRole("radio", { name: "Studier" }))
      await user.click(screen.getByRole("checkbox"))
      await user.click(screen.getByRole("button", { name: overskrift }))
      const melding = await screen.findByText(tekst)
      await waitFor(() => expect(melding.closest("[tabindex]")).toHaveFocus())
      expect(screen.getByRole("radio", { name: "Studier" })).toBeChecked()
      expect(screen.getByRole("checkbox")).toBeChecked()
      expect(screen.queryByText(suksess)).not.toBeInTheDocument()
    },
  )

  it("sperrer dobbeltinnsending mens forespørselen pågår", async () => {
    let fullfor!: () => void
    const venter = new Promise<void>((resolve) => {
      fullfor = resolve
    })
    const { user, action, container } = renderSkjema(async () => {
      await venter
      return { status: "vellykket" }
    })
    await user.click(screen.getByRole("radio", { name: "I jobb" }))
    await user.click(screen.getByRole("checkbox"))
    const knapp = screen.getByRole("button", { name: overskrift })
    await user.dblClick(knapp)
    fireEvent.submit(container.querySelector("form")!)
    expect(knapp).toBeDisabled()
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled()
    }
    expect(action).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(suksess)).not.toBeInTheDocument()
    await act(async () => fullfor())
    expect(await screen.findByText(suksess)).toBeInTheDocument()
  })

  it("lar innbygger prøve på nytt etter feil", async () => {
    let status: AvsluttOppfolgingResultat = { status: "feilet" }
    const { user } = renderSkjema(async () => status)
    await user.click(screen.getByRole("radio", { name: "Annet" }))
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: overskrift }))
    expect(await screen.findByText(generellFeil)).toBeInTheDocument()
    status = { status: "vellykket" }
    await user.click(screen.getByRole("button", { name: overskrift }))
    expect(await screen.findByText(suksess)).toBeInTheDocument()
  })

  it("lenker tilbake til aktivitetsplanen, ikke Inngars forside", () => {
    renderSkjema()
    expect(screen.getByRole("link", { name: "Tilbake" })).toHaveAttribute(
      "href",
      "https://aktivitetsplan.ekstern.dev.nav.no/",
    )
  })
})
