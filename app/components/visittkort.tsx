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
const VisittkortInner = ({ fnrState }: { fnrState: FnrState }) => {
    const rootMountRef = useRef(null)
    console.log("visittkort inner fnr", fnrState)

    // const key = key + 1

    useEffect(() => {
        if (!rootMountRef.current) return
        // if (fnrState.loading) return
        const appMountFunction = window.NAVSPA[exportName]
        const lol = appMountFunction(rootMountRef.current, {
            enhet: undefined,
            fnr: (!fnrState.loading && fnrState.fnr) || "",
            tilbakeTilFlate: "",
            visVeilederVerktoy: true,
            key: getIncrementedKey(),
        })
    })

    return <div ref={rootMountRef}></div>
}

const Visittkort = ({ fnrState }: { fnrState: FnrState }) => {
    return (
        <div className="bg-white">
            <ClientOnlyChild>
                <VisittkortInner fnrState={fnrState} />
            </ClientOnlyChild>
        </div>
    )
}
export default Visittkort
