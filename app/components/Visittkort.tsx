import type { Route } from "../../.react-router/types/app/routes/+types"
import { useEffect, useRef } from "react"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { type FnrState } from "~/root"
import { logger } from "../../server/logger"
import { getOversiktenLink } from "~/config.client"
import { Skeleton } from "@navikt/ds-react"

const exportName = "veilarbvisittkortfs"

interface VisittKortProps {
    enhet?: string | null
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

export const VisittkortLoading = () => {
    return (
        <div className="bg-white justify-center flex p-2">
            <div className="flex items-center flex-1 max-w-[120rem]">
                <div className="h-4 w-[44.79px] mr-2"></div>
                <Skeleton variant="circle" width={48} height={48} />
                <div className="ml-2">
                    <Skeleton width="150px" height="20px" />
                </div>
                <Skeleton className="ml-16" width="150px" height="20px" />
                <Skeleton className="ml-16" width="150px" height="20px" />
            </div>
        </div>
    )
}

const Visittkort = ({
    fnrState,
    navKontor,
}: {
    fnrState: FnrState
    navKontor: string | null | undefined
}) => {
    if (fnrState.loading) return <VisittkortLoading />
    if (!fnrState.fnr) return null
    return (
        <div className="bg-white">
            <ClientOnlyChild placeholder={<VisittkortPlaceholder />}>
                <VisittkortInner fnr={fnrState.fnr} enhet={navKontor} />
            </ClientOnlyChild>
        </div>
    )
}
export default Visittkort
