import type { Route } from "../../.react-router/types/app/routes/+types/ingenBrukerValgtPage"
import { Alert, Heading } from "@navikt/ds-react"

export default function Index({}: Route.ComponentProps) {
    return (
        <div className="flex flex-col w-[620px] p-4 mx-auto space-y-4">
            <Heading size="large">Start arbeidsrettet oppfølging</Heading>
            <Alert variant="info">Ingen bruker valgt</Alert>
        </div>
    )
}
