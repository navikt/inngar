import { Alert, BodyShort, Button, Heading, Link } from "@navikt/ds-react"
import { arbeidssokerRegistreringUrl } from "~/registreringPage/StartOppfolgingForm.tsx"
import { useFetcher } from "react-router"

export const ReaktiveringsForm = ({ fnr }: { fnr: string }) => {
    const fetcher = useFetcher()
    const error = "error" in (fetcher?.data || {}) ? fetcher.data.error : null
    const result =
        "resultat" in (fetcher?.data || {})
            ? (fetcher.data as { kode: string; resultat: string })
            : null

    return (
        <div className="flex flex-col space-y-8 mx-auto">
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Denne personen er på vei til å gå ut av arbeidsrettet
                        oppfølging automatisk. Hvis du ønsker at bruker fortsatt
                        skal ha arbeidsrettet oppfølging, kan du reaktivere
                        brukeren i Arena her.
                    </BodyShort>
                </div>
            </Alert>
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Personen blir ikke registrert som arbeidssøker når du
                        reaktiverer bruker i Arena. Dersom personen også er
                        arbeidssøker bør du benytte{" "}
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
                        ikke at personen får noen meldeplikt.
                    </BodyShort>
                </div>
            </Alert>
            <fetcher.Form method="post" className="space-y-4">
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <Button loading={fetcher.state == "submitting"}>
                    Reaktiver bruker i Arena
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
