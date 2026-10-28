import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it, vi } from "vitest"
import { AvsluttOppfolgingPage } from "./AvsluttOppfolgingPage"
import type { AvsluttOppfolgingResultat } from "./skjema"

const overskrift = "Avslutt arbeidsrettet oppfølging"
const suksess = "Avslutningen av arbeidsrettet oppfølging var vellykket."
const arsakLabel =
  "Velg årsak til at du ikke lenger ønsker arbeidsrettet oppfølging."
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
  it("krever valgt avslutningsårsak og flytter fokus til select uten å sende skjema", async () => {
    const { user, action } = renderSkjema()

    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: overskrift }))

    const select = screen.getByRole("combobox", { name: arsakLabel })
    expect(screen.getByText("Du må velge en årsak.")).toBeInTheDocument()
    expect(select).toBeInvalid()
    expect(select).toHaveFocus()
    expect(action).not.toHaveBeenCalled()
  })

  it("feiler validering når bruker velger tilbake til «Velg årsak»", async () => {
    const { user, action } = renderSkjema()
    const select = screen.getByRole("combobox")

    await user.selectOptions(select, "Studier")
    await user.selectOptions(select, "Velg årsak")
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: overskrift }))

    expect(screen.getByText("Du må velge en årsak.")).toBeInTheDocument()
    expect(select).toBeInvalid()
    expect(select).toHaveFocus()
    expect(action).not.toHaveBeenCalled()
  })

  it("viser begge feil og flytter fokus til første felt (årsak) uten å sende skjemaet", async () => {
    const { user, action } = renderSkjema()

    await user.click(screen.getByRole("button", { name: overskrift }))

    expect(screen.getByText("Du må velge en årsak.")).toBeInTheDocument()
    expect(
      screen.getByText("Du må bekrefte før du kan avslutte oppfølgingen."),
    ).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(action).not.toHaveBeenCalled()
  })

  it("flytter fokus til checkbox når bare bekreftelse mangler", async () => {
    const { user, action } = renderSkjema()

    await user.selectOptions(screen.getByRole("combobox"), "Studier")
    await user.click(screen.getByRole("button", { name: overskrift }))

    expect(
      screen.getByText("Du må bekrefte før du kan avslutte oppfølgingen."),
    ).toBeInTheDocument()
    expect(screen.getByRole("checkbox")).toHaveFocus()
    expect(action).not.toHaveBeenCalled()
  })

  it.each([
    ["Studier", "STUDIER"],
    ["Annet", "ANNET"],
  ])(
    "Valgt årsak og bekreftelse sender skjema og erstatter innholdet på siden (%s)",
    async (etikett, begrunnelse) => {
      const { user, motta, container } = renderSkjema()
      const piktogram = container.querySelector("main > svg")

      await user.selectOptions(screen.getByRole("combobox"), etikett)
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
      // Sjekker om AvsluttOppfolgingPage komponenten er fjernet fra DOM og erstattet med bekreftelse
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
      expect(screen.queryByText("Hei!")).not.toBeInTheDocument()
      expect(
        screen.queryByRole("link", { name: "Tilbake" }),
      ).not.toBeInTheDocument()
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

      await user.selectOptions(screen.getByRole("combobox"), "Studier")
      await user.click(screen.getByRole("checkbox"))
      await user.click(screen.getByRole("button", { name: overskrift }))
      const melding = await screen.findByText(tekst)

      await waitFor(() => expect(melding.closest("[tabindex]")).toHaveFocus())
      expect(screen.getByRole("combobox")).toHaveValue("STUDIER")
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
    await user.selectOptions(screen.getByRole("combobox"), "I Jobb")
    await user.click(screen.getByRole("checkbox"))
    const knapp = screen.getByRole("button", { name: overskrift })
    await user.dblClick(knapp)
    fireEvent.submit(container.querySelector("form")!)
    expect(knapp).toBeDisabled()
    expect(screen.getByRole("combobox")).toBeDisabled()
    expect(action).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(suksess)).not.toBeInTheDocument()
    await act(async () => fullfor())
    expect(await screen.findByText(suksess)).toBeInTheDocument()
  })

  it("lar bruker prøve på nytt etter skjemafeil", async () => {
    let status: AvsluttOppfolgingResultat = { status: "feilet" }
    const { user } = renderSkjema(async () => status)
    await user.selectOptions(screen.getByRole("combobox"), "Annet")
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
