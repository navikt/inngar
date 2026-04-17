import { BodyLong, Heading } from "@navikt/ds-react"
import KvitteringIkon from "../startOppfolging/kvittering-ikon.svg?react"
import type { Route } from "./+types/blirKontaktetPage"

export const loader = ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url)
    const frist = url.searchParams.get("frist") ?? ""
    return { frist }
}

const BlirKontaktetPage = ({ loaderData }: Route.ComponentProps) => {
    const { frist } = loaderData
    const formattertFrist = new Date(frist).toLocaleDateString("no-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
    return (
        <main className="flex gap-8 justify-center pt-4 md:pt-12 pb-4 p-4 pb-20">
            <KvitteringIkon />
            <div className="max-w-paragraph-width flex-1 flex flex-col gap-4 min-h-96 min-h-0">
                <Heading size={"large"}>Vi tar kontakt med deg</Heading>
                <BodyLong>
                    En veileder hos oss vil kontakte deg innen utgangen av {formattertFrist}. Veilederen
                    vil hjelpe deg videre med samtykke og registrering.
                </BodyLong>
            </div>
        </main>
    )
}

export default BlirKontaktetPage