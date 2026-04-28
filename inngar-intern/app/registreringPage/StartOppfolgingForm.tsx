import { useFetcher } from "react-router"
import { isUnder18 } from "~/util/erUnder18Helper"
import { useState, useEffect } from "react"
import {
    Accordion,
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    Link,
} from "@navikt/ds-react"
import RegistreringUnder18 from "~/registreringPage/RegistreringUnder18"
import ManuellGodkjenningIkkeBosattAlert from "~/registreringPage/ManuellGodkjenningIkkeBosattAlert.tsx"
import ManuellGodkjenningMidlertidigBosattAlert from "~/registreringPage/ManuellGodkjenningMidlertidigBosattAlert.tsx"
import { NavKontorInfo } from "~/registreringPage/NavKontorInfo.tsx"
import { EnvType, loggKnappKlikket, loggBesokUnder18 } from "common"
import { getEnv } from "~/util/envUtil.ts"

export const arbeidssokerRegistreringUrl =
    getEnv().type === EnvType.prod
        ? "https://arbeidssokerregistrering-for-veileder.intern.nav.no"
        : "https://arbeidssokerregistrering-for-veileder.ansatt.dev.nav.no"

export interface NavKontor {
    navn: string
    id: string
}

export const StartOppfolgingForm = ({
    navKontor,
    kontorOptions,
    fnr,
    under18,
    kreverManuellGodkjenningPgaIkkeBosatt,
    kreverManuellGodkjenningPgaDnummerIkkeEosGbr,
}: {
    navKontor: Promise<NavKontor | null>
    kontorOptions?: Promise<NavKontor[]>
    fnr: string
    under18: boolean | undefined
    kreverManuellGodkjenningPgaIkkeBosatt: boolean
    kreverManuellGodkjenningPgaDnummerIkkeEosGbr: boolean
}) => {
    const startOppfolgingFetcher = useFetcher()
    const error =
        "error" in (startOppfolgingFetcher?.data || {})
            ? startOppfolgingFetcher.data.error
            : null
    const result =
        "resultat" in (startOppfolgingFetcher?.data || {})
            ? (startOppfolgingFetcher.data as {
                  kode: string
                  resultat: string
              })
            : null
    const brukerErUnder18 = under18 || isUnder18(fnr)
    const [erSamtykkeBekreftet, setErSamtykkeBekreftet] = useState(false)
    const [erManueltGodkjent, setErManueltGodkjent] = useState(false)

    useEffect(() => {
        if (brukerErUnder18) {
            loggBesokUnder18()
        }
    }, [])

    return (
        <div className="flex flex-col mt-4 space-y-8 mx-auto">
            {brukerErUnder18 ? (
                <RegistreringUnder18 bekreftSamtykke={setErSamtykkeBekreftet} />
            ) : null}
            {kreverManuellGodkjenningPgaIkkeBosatt ? (
                <ManuellGodkjenningIkkeBosattAlert
                    bekreftGodkjenning={setErManueltGodkjent}
                />
            ) : null}
            {kreverManuellGodkjenningPgaDnummerIkkeEosGbr ? (
                <ManuellGodkjenningMidlertidigBosattAlert
                    bekreftGodkjenning={setErManueltGodkjent}
                />
            ) : null}
            <startOppfolgingFetcher.Form method="post" className="space-y-4">
                {error ? <FormError message={error} /> : null}
                <NavKontorInfo
                    enhet={navKontor}
                    kontorOptions={kontorOptions}
                />
                <Alert inline variant={"info"}>
                    <div className="space-y-4">
                        <BodyShort>
                            Brukeren vil få informasjon på Min Side om at det er
                            startet arbeidsrettet oppfølging.
                        </BodyShort>
                    </div>
                </Alert>
                <Alert inline variant={"info"}>
                    <div className="space-y-4">
                        <BodyShort>
                            Brukeren blir ikke registrert som arbeidssøker når
                            du starter arbeidsrettet oppfølging her. Dersom
                            brukeren også er arbeidssøker bør du benytte{" "}
                            <Link
                                href={arbeidssokerRegistreringUrl}
                                variant="neutral"
                            >
                                arbeidssøkerregistreringen.
                            </Link>
                        </BodyShort>
                    </div>
                </Alert>
                <Alert inline variant={"info"}>
                    <div className="space-y-4">
                        <BodyShort>
                            Registreringen for arbeidsrettet oppfølging medfører
                            ikke at brukeren får noen meldeplikt.
                        </BodyShort>
                    </div>
                </Alert>
                <input type="hidden" name="fnr" value={fnr} />
                <input
                    type="hidden"
                    name="actionType"
                    value="startOppfolging"
                />
                <Accordion className="my-8">
                    <Accordion.Item>
                        <Accordion.Header>
                            Arbeidssøker eller kun arbeidsrettet oppfølging?
                        </Accordion.Header>
                        <Accordion.Content>
                            Det er laget en veiviser for brukere på nav.no
                            som er usikre på om de skal registrere seg som
                            arbeidssøker eller kun be om arbeidsrettet
                            oppfølging. Du kan bruke{" "}
                            <Link
                                href="https://www.nav.no/arbeid/veiviser"
                                target="_blank"
                                onClick={() => loggKnappKlikket("Trykket på lenke til veiviseren")}
                            >
                                veiviseren
                            </Link>{" "}
                            som en guide for å avgjøre hva som er riktig for
                            brukeren.
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion>
                <Button
                    disabled={
                        (brukerErUnder18 && !erSamtykkeBekreftet) ||
                        ((kreverManuellGodkjenningPgaIkkeBosatt ||
                            kreverManuellGodkjenningPgaDnummerIkkeEosGbr) &&
                            !erManueltGodkjent) ||
                        startOppfolgingFetcher.state != "idle"
                    }
                    loading={startOppfolgingFetcher.state != "idle"}
                    onClick={() => {
                        if (brukerErUnder18) {
                            loggKnappKlikket(
                                "Start arbeidsrettet oppfølging for bruker under 18",
                            )
                        } else {
                            loggKnappKlikket("Start arbeidsrettet oppfølging")
                        }
                    }}
                >
                    Start arbeidsrettet oppfølging
                </Button>
            </startOppfolgingFetcher.Form>
            {result ? (
                <Alert variant="success">
                    <Heading size="small">{result.kode}</Heading>
                    <BodyShort>{result.resultat}</BodyShort>
                </Alert>
            ) : null}
        </div>
    )
}

export const FormError = ({ message }: { message: string }) => {
    return (
        <ErrorSummary>
            <ErrorSummary.Item href="#searchfield-r2">
                {message}
            </ErrorSummary.Item>
        </ErrorSummary>
    )
}
