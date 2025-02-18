import type { Route } from "../../.react-router/types/app/routes/+types"
import { useEffect, useRef } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { type FnrState } from "~/root"
import { logger } from "../../server/logger"

const exportName = "veilarbvisittkortfs"

interface VisittKortProps {
    enhet?: string
    fnr: string
    tilbakeTilFlate: string
    visVeilederVerktoy: boolean
    key: string
}

declare const window: {
    NAVSPA: {
        veilarbvisittkortfs: (
            node: HTMLElement,
            props: VisittKortProps,
        ) => React.ReactElement
    }
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error("Aborted:", error)
    }
}

let key = 1
const getIncrementedKey = () => {
    key = key + 1
    return (key + 1).toString()
}
const VisittkortInner = ({ fnr }: { fnr: string }) => {
    const rootMountRef = useRef(null)

    useEffect(() => {
        if (!rootMountRef.current) return
        const appMountFunction = window.NAVSPA[exportName]
        appMountFunction(rootMountRef.current, {
            enhet: undefined,
            fnr,
            tilbakeTilFlate: "",
            visVeilederVerktoy: true,
            key: getIncrementedKey(),
        })
    })

    return <div ref={rootMountRef}></div>
}

const Visittkort = ({ fnrState }: { fnrState: FnrState }) => {
    if (fnrState.loading || !fnrState.fnr) return null
    return (
        <div className="bg-white">
            <ClientOnlyChild>
                <VisittkortInner fnr={fnrState.fnr} />
            </ClientOnlyChild>
        </div>
    )
}
export default Visittkort
