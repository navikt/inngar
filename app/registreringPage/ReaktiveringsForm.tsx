import { Alert, BodyShort, Button, Heading, Link } from "@navikt/ds-react"
import { arbeidssokerRegistreringUrl } from "~/registreringPage/StartOppfolgingForm.tsx"
import { useFetcher } from "react-router"
import { ManuellGodkjenningAlert } from "~/registreringPage/ManuellGodkjenningAlert.tsx"
import { useState } from "react"
import { loggKnappKlikket } from "~/amplitude.client.ts"
import { reaktiverOppfolgingAction } from "~/routes"

export const ReaktiveringsForm = ({
    fnr,
    kreverManuellGodkjenning,
}: {
    fnr: string
    kreverManuellGodkjenning: boolean
}) => {
    const fetcher = useFetcher()
    const error = "error" in (fetcher?.data || {}) ? fetcher.data.error : null
    const result =
        "resultat" in (fetcher?.data || {})
            ? (fetcher.data as { kode: string; resultat: string })
            : null
    const [erManueltGodkjent, setErManueltGodkjent] = useState(false)

    return (
        <div className="flex flex-col space-y-8 mx-auto">
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Denne brukeren vil automatisk miste tilgang til
                        arbeidsrettet oppfølging på grunn av inaktivering i
                        Arena. Hvis du ønsker at brukeren fortsatt skal motta
                        arbeidsrettet oppfølging, kan du reaktivere den her.
                        Dette vil gjenopprette aktiv status både i Modia
                        arbeidsrettet oppfølging og i Arena.
                    </BodyShort>
                </div>
            </Alert>
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Brukeren blir ikke registrert som arbeidssøker når du
                        reaktiverer arbeidsrettet oppfølging. Dersom brukeren
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
            {kreverManuellGodkjenning ? (
                <ManuellGodkjenningAlert
                    bekreftGodkjenning={setErManueltGodkjent}
                />
            ) : null}
            <fetcher.Form
                method="post"
                action={reaktiverOppfolgingAction}
                className="space-y-4"
            >
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <Button
                    loading={fetcher.state == "submitting"}
                    disabled={
                        kreverManuellGodkjenning ? !erManueltGodkjent : false
                    }
                    onClick={() =>
                        loggKnappKlikket("Reaktiver arbeidsrettet oppfølging")
                    }
                >
                    Reaktiver arbeidsrettet oppfølging
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
