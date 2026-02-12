import { useEffect } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { type FnrState } from "~/root"
import { getOversiktenLink } from "~/config.client.ts"

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "ao-visittkort": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    fnr?: string
                    enhet?: string
                    tilbakeTilFlate?: string
                    visVeilederVerktoy?: string
                    skjulEtiketter?: string
                    avsluttOppfolgingOpptelt?: string
                },
                HTMLElement
            >
        }
    }
}

export interface VisittKortProps {
    enhet?: string
    fnr: string
    tilbakeTilFlate: string
    visVeilederVerktoy: boolean
    key: string
}

const VisittkortInner = ({
    fnr,
    enhet,
}: {
    fnr: string
    enhet: string | null | undefined
}) => {
    const oversiktenLink = getOversiktenLink()
    return (
        <div>
            <ao-visittkort
                enhet={enhet ?? "1234"}
                fnr={fnr ?? "123123123"}
                tilbakeTilFlate={oversiktenLink}
                visVeilederVerktoy={"true"}
                key={fnr}
            ></ao-visittkort>
        </div>
    )
}
const VisittkortPlaceholder = () => {
    return <div className="bg-white h-[76.8px]"></div>
}

const Visittkort = ({
    fnrState,
    navKontor,
}: {
    fnrState: FnrState
    navKontor: string | null | undefined
}) => {
    useEffect(() => {
        console.log("On mount Visittkort")
    }, [])

    if (fnrState.loading || !fnrState.fnr) return null
    return (
        <div className="bg-ax-bg-default min-h-[76.8px]">
            <ClientOnlyChild placeholder={<VisittkortPlaceholder />}>
                <VisittkortInner fnr={fnrState.fnr} enhet={navKontor} />
            </ClientOnlyChild>
        </div>
    )
}
export default Visittkort
