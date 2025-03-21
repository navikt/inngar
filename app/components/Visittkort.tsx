import type { Route } from "../../.react-router/types/app/routes/+types"
import { useEffect, useRef } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { type FnrState } from "~/root"
import { logger } from "../../server/logger"
import { getOversiktenLink } from "~/config.client"

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
const VisittkortInner = ({
    fnr,
    enhet,
}: {
    fnr: string
    enhet: string | null | undefined
}) => {
    const rootMountRef = useRef(null)

    useEffect(() => {
        if (!rootMountRef.current) return
        const oversiktenLink = getOversiktenLink()
        const appMountFunction = window.NAVSPA[exportName]
        appMountFunction(rootMountRef.current, {
            enhet,
            fnr,
            tilbakeTilFlate: oversiktenLink,
            visVeilederVerktoy: false,
            key: fnr,
        })
    })

    return <div ref={rootMountRef}></div>
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
