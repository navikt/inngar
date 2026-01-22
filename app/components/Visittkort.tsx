import type { Route } from "../../.react-router/types/app/routes/+types"
import { useEffect, useRef } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { type FnrState } from "~/root"
import { logger } from "../../server/logger"
import { useVisittkortNavspa } from "~/util/useNAVSPA.tsx"
import { getOversiktenLink } from "~/config.client.ts"

const exportName = "veilarbvisittkortfs"

export interface VisittKortProps {
    enhet?: string
    fnr: string
    tilbakeTilFlate: string
    visVeilederVerktoy: boolean
    key: string
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error("Aborted:", error)
    }
}

const VisittkortInner = ({
    fnr,
    enhet,
}: {
    fnr: string
    enhet: string | null | undefined
}) => {
    const rootMountRef = useRef(null)
    const mountFunction = useVisittkortNavspa()

    useEffect(() => {
        if (!rootMountRef.current) return
        if (!mountFunction) return
        console.log("Rendrer visittkort")
        const oversiktenLink = getOversiktenLink()
        mountFunction(rootMountRef.current, {
            enhet,
            fnr,
            tilbakeTilFlate: oversiktenLink,
            visVeilederVerktoy: false,
            key: fnr,
        })
    }, [mountFunction])

    return <div className="bg-white h-[76.8px]" ref={rootMountRef}></div>
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
        <div className="bg-white">
            <ClientOnlyChild placeholder={<VisittkortPlaceholder />}>
                <VisittkortInner fnr={fnrState.fnr} enhet={navKontor} />
            </ClientOnlyChild>
        </div>
    )
}
export default Visittkort
