import { ModiacontextholderApi } from "~/api/modiacontextholder"
import type { Route } from "../../.react-router/types/app/routes/+types/ingenBrukerValgtPage"
import { Alert, Heading } from "@navikt/ds-react"
import { redirect } from "react-router"

export const loader = async ({ request }: Route.LoaderArgs) => {
    const aktivBruker = await ModiacontextholderApi.hentAktivBruker(request)
    if (aktivBruker.ok && aktivBruker.data.aktivBruker) {
        const fnrCode = await ModiacontextholderApi.generateForFnr(
            aktivBruker.data.aktivBruker,
        )
        if (fnrCode) {
            return redirect(`/${fnrCode}`)
        }
    }
    return {}
}

export default function Index({}: Route.ComponentProps) {
    return (
        <div className="flex flex-col w-[620px] p-4 mx-auto gap-4">
            <Heading size="large">Start arbeidsrettet oppfølging</Heading>
            <Alert variant="info">Ingen bruker valgt</Alert>
        </div>
    )
}
