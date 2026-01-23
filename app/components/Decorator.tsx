import { useEffect, useRef } from "react"
import type { Route } from "../../.react-router/types/app/routes/+types"
import { EnvType, getEnv } from "~/util/envUtil"
import { ClientOnlyChild } from "~/util/remoteUtil"
import { logger } from "../../server/logger"
import { useDecorateNavspa } from "~/util/useNAVSPA.tsx"

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}

type OnFnrChanged = (fnr?: string | null | undefined) => void

const env = getEnv()

const DecoratorPlaceholder = () => {
    return <div className="bg-gray-900 min-h-[48px]"></div>
}

const InternarbeidsflateDecorator = ({
    onFnrChanged,
}: {
    onFnrChanged: OnFnrChanged
}) => {
    const rootMountRef = useRef<HTMLDivElement>(null)
    const mountFunction = useDecorateNavspa()
    const hasMountedRef = useRef(false)

    useEffect(() => {
        // Only mount once when NAVSPA becomes available
        if (rootMountRef.current && mountFunction && !hasMountedRef.current) {
            hasMountedRef.current = true
            try {
                mountFunction(rootMountRef.current, {
                    fetchActiveUserOnMount: true,
                    onEnhetChanged: () => {},
                    onFnrChanged: onFnrChanged,
                    showSearchArea: true,
                    showEnheter: false,
                    appName: "Arbeidsrettet oppfølging",
                    environment: env.type == EnvType.prod ? "prod" : "q2",
                    urlFormat:
                        env.ingressType === "ansatt" ? "ANSATT" : "NAV_NO",
                    showHotkeys: false,
                    proxy: "/api/modiacontextholder",
                })
            } catch (e) {
                console.error("Failed to mount NAVSPA decorator:", e)
                hasMountedRef.current = false // Allow retry on error
            }
        }
    }, [mountFunction, onFnrChanged])

    // Show placeholder while waiting for NAVSPA to load
    if (!mountFunction) {
        return <DecoratorPlaceholder />
    }

    return <div className="bg-gray-900 min-h-[48px]" ref={rootMountRef}></div>
}

const Decorator = ({ onFnrChanged }: { onFnrChanged: OnFnrChanged }) => {
    return (
        <ClientOnlyChild placeholder={<DecoratorPlaceholder />}>
            <InternarbeidsflateDecorator onFnrChanged={onFnrChanged} />
        </ClientOnlyChild>
    )
}
export default Decorator
