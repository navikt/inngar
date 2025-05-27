import { useFetcher } from "react-router"
import { isUnder18 } from "~/util/erUnder18Helper"
import { useState } from "react"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    Link,
} from "@navikt/ds-react"
import RegistreringUnder18 from "~/registreringPage/RegistreringUnder18"
import { NavKontorInfo } from "~/registreringPage/NavKontorInfo"
import { EnvType, getEnv } from "~/util/envUtil"
import { ManuellGodkjenningAlert } from "~/registreringPage/ManuellGodkjenningAlert.tsx"
import { loggKnappKlikket } from "~/amplitude.client.ts"
import type { BrukerStatus } from "~/registreringPage/BrukerStatus.ts"

export const arbeidssokerRegistreringUrl =
    getEnv().type === EnvType.prod
        ? "https://arbeidssokerregistrering-for-veileder.intern.nav.no"
        : "https://arbeidssokerregistrering-for-veileder.ansatt.dev.nav.no"

export interface NavKontor {
    navn: string
    id: string
    kilde: string
}

export const StartOppfolgingForm = ({
    navKontor,
    fnr,
    brukerStatus,
}: {
    navKontor: NavKontor | null
    fnr: string
    brukerStatus:
        | BrukerStatus.IKKE_UNDER_OPPFOLGING
        | BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT
        | BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR
}) => {
    const fetcher = useFetcher()
    const kreverManuellGodkjenning =
        brukerStatus !== BrukerStatus.IKKE_UNDER_OPPFOLGING
    const error = "error" in (fetcher?.data || {}) ? fetcher.data.error : null
    const result =
        "resultat" in (fetcher?.data || {})
            ? (fetcher.data as { kode: string; resultat: string })
            : null
    const brukerErUnder18 = isUnder18(fnr)
    const [erSamtykkeBekreftet, setErSamtykkeBekreftet] = useState(false)
    const [erManueltGodkjent, setErManueltGodkjent] = useState(false)

    return (
        <div className="flex flex-col space-y-8 mx-auto">
            {brukerErUnder18 ? (
                <RegistreringUnder18 bekreftSamtykke={setErSamtykkeBekreftet} />
            ) : null}
            {kreverManuellGodkjenning ? (
                <ManuellGodkjenningAlert
                    brukerStatus={brukerStatus}
                    bekreftGodkjenning={setErManueltGodkjent}
                />
            ) : null}
            <NavKontorInfo enhet={navKontor} />
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
                        Brukeren blir ikke registrert som arbeidssøker når du
                        starter arbeidsrettet oppfølging her. Dersom brukeren
                        også er arbeidssøker bør du benytte{" "}
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
            <fetcher.Form method="post" className="space-y-4">
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <input
                    type="hidden"
                    name="actionType"
                    value="startOppfolging"
                />
                <Button
                    disabled={
                        (brukerErUnder18 && !erSamtykkeBekreftet) ||
                        (kreverManuellGodkjenning && !erManueltGodkjent)
                    }
                    loading={fetcher.state == "submitting"}
                    onClick={() =>
                        loggKnappKlikket("Start arbeidsrettet oppfølging")
                    }
                >
                    Start arbeidsrettet oppfølging
                </Button>
            </fetcher.Form>
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
