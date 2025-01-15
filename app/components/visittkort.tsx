import type { Route } from "../../.react-router/types/app/routes/+types"
import { logger } from "~/logger"
import { useEffect, useRef } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { useFnrState } from "~/root"

const exportName = "veilarbvisittkortfs"

interface VisittKortProps {
    enhet?: string
    fnr: string
    tilbakeTilFlate: string
    visVeilederVerktoy: boolean
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
        logger.error(error)
    }
}

type OnFnrChanged = (fnr?: string | null | undefined) => void

const VisittkortInner = () => {
    const rootMountRef = useRef(null)
    const fnrState = useFnrState()
    const appMountFunction = window.NAVSPA[exportName]

    useEffect(() => {
        if (rootMountRef.current && appMountFunction) {
            appMountFunction(rootMountRef.current, {
                enhet: undefined,
                fnr: fnrState.loading == false ? fnrState.fnr : "",
                tilbakeTilFlate: "",
                visVeilederVerktoy: true,
            })
        }
    })

    return <div ref={rootMountRef}> </div>
}

const Visittkort = () => {
    return (
        <ClientOnlyChild>
            <VisittkortInner />
        </ClientOnlyChild>
    )
}
export default Visittkort
