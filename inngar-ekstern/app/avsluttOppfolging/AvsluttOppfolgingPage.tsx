import {
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Link,
  LocalAlert,
  Select,
} from "@navikt/ds-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { useFetcher } from "react-router"
import { EnvType, loggKnappKlikket } from "common"
import type { clientAction } from "~/routes/avsluttOppfolgingPage"
import { env, urls } from "~/startOppfolging/urls"
import { AvsluttOppfolgingInnhold } from "./AvsluttOppfolgingInnhold"
import AvsluttOppfolgingPiktogram from "./avslutt-oppfolging.svg?react"
import {
  validerSkjema,
  type Skjemafeil,
  type Begrunnelse,
  begrunnelseEtiketter,
  begrunnelser,
} from "./skjema"

export function AvsluttOppfolgingPage() {
  const lenkeMiljo = env === EnvType.local ? EnvType.dev : env
  const fetcher = useFetcher<typeof clientAction>()
  const [bekreftet, setBekreftet] = useState(false)
  const [begrunnelse, setBegrunnelse] = useState<Begrunnelse | "">("")
  const [feil, setFeil] = useState<Skjemafeil>({})
  const bekreftelseRef = useRef<HTMLInputElement>(null)
  const begrunnelseRef = useRef<HTMLSelectElement>(null)
  const meldingRef = useRef<HTMLDivElement>(null)
  const innsendingRef = useRef(false)
  const sender = fetcher.state !== "idle"
  const resultat = fetcher.data
  const vellykket = resultat?.status === "vellykket"

  useEffect(() => {
    if (fetcher.state !== "idle") return
    innsendingRef.current = false
    if (resultat?.status === "ugyldig") {
      setFeil(resultat.feil)
      if (resultat.feil.begrunnelse) begrunnelseRef.current?.focus()
      else bekreftelseRef.current?.focus()
    } else if (resultat) {
      meldingRef.current?.focus()
    }
  }, [fetcher.state, resultat])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (innsendingRef.current || sender || vellykket) return
    const skjemafeil = validerSkjema(bekreftet, begrunnelse)
    setFeil(skjemafeil)
    if (skjemafeil.bekreftet || skjemafeil.begrunnelse) {
      if (skjemafeil.begrunnelse) begrunnelseRef.current?.focus()
      else bekreftelseRef.current?.focus()
      return
    }
    innsendingRef.current = true
    fetcher.submit(event.currentTarget, { method: "post" })
  }

  return (
    <main id="main" className="flex justify-center gap-8 p-4 md:pt-12 pb-16">
      <div className="hidden lg:block shrink-0 pt-14">
        <AvsluttOppfolgingPiktogram />
      </div>
      <div className="max-w-paragraph-width flex-1 flex flex-col gap-8 min-w-0">
        {!vellykket && (
          <Link href={urls.aktivitetsplan[lenkeMiljo]} className="self-start">
            Tilbake
          </Link>
        )}
        <Heading level="1" size="xlarge">
          Avslutt arbeidsrettet oppfølging
        </Heading>
        {vellykket ? (
          <>
            <LocalAlert status="success" ref={meldingRef} tabIndex={-1}>
              <LocalAlert.Header>
                <LocalAlert.Title>
                  Avslutningen av arbeidsrettet oppfølging var vellykket.
                </LocalAlert.Title>
              </LocalAlert.Header>
            </LocalAlert>
            <Link href={urls.minside[lenkeMiljo]} className="self-start">
              Gå til Min side
            </Link>
          </>
        ) : (
          <>
            <AvsluttOppfolgingInnhold />
            <fetcher.Form
              method="post"
              onSubmit={onSubmit}
              noValidate
              aria-busy={sender}
              className="flex flex-col gap-8"
            >
              <Select
                label="Velg årsak til at du ikke lenger ønsker arbeidsrettet oppfølging."
                error={feil.begrunnelse}
                onChange={(e) => {
                  setBegrunnelse(e.target.value as Begrunnelse)
                }}
                ref={begrunnelseRef}
                defaultValue=""
                disabled={sender}
                name="begrunnelse"
              >
                <option value="">Velg årsak</option>
                {begrunnelser.map((key) => (
                  <option key={key} value={key}>{begrunnelseEtiketter[key]}</option>
                ))}
              </Select>
              <CheckboxGroup
                legend="Bekreftelse"
                hideLegend
                error={feil.bekreftet}
                disabled={sender}
              >
                <Checkbox
                  name="bekreftet"
                  value="bekreftet"
                  checked={bekreftet}
                  onChange={(event) => {
                    setBekreftet(event.target.checked)
                  }}
                  ref={bekreftelseRef}
                  disabled={sender}
                >
                  Jeg har satt meg inn i hva det innebærer å avslutte min
                  arbeidsrettede oppfølging.
                </Checkbox>
              </CheckboxGroup>
              {!sender &&
                (resultat?.status === "feilet" ||
                  resultat?.status === "kanIkkeAvsluttes") && (
                  <LocalAlert status="error" ref={meldingRef} tabIndex={-1}>
                    <LocalAlert.Header>
                      <LocalAlert.Title>
                        {resultat.status === "kanIkkeAvsluttes"
                          ? "Oppfølgingen kan ikke avsluttes nå."
                          : "Noe gikk galt, og oppfølgingen ble ikke avsluttet. Prøv igjen senere."}
                      </LocalAlert.Title>
                    </LocalAlert.Header>
                  </LocalAlert>
                )}
              <div>
                <Button
                  type="submit"
                  loading={sender}
                  disabled={sender}
                  onClick={() =>
                    loggKnappKlikket("Avslutt arbeidsrettet oppfølging")
                  }
                  data-umami-event="avslutt-oppfolging"
                >
                  Avslutt arbeidsrettet oppfølging
                </Button>
              </div>
            </fetcher.Form>
          </>
        )}
      </div>
    </main>
  )
}
