import { useEffect, useRef } from "react"
import type { Route } from "../../.react-router/types/app/routes/+types"
import { getEnv } from "~/util/envUtil"
import { ClientOnlyChild } from "~/util/remoteUtil"
import type { DecoratorProps } from "~/components/DecoratorProps"
import { logger } from "../../server/logger"

const exportName = "internarbeidsflate-decorator-v3"

declare const window: {
    NAVSPA: {
        "internarbeidsflate-decorator-v3": (
            node: HTMLElement,
            props: DecoratorProps,
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

const InternarbeidsflateDecorator = ({
    onFnrChanged,
}: {
    onFnrChanged: OnFnrChanged
}) => {
    const rootMountRef = useRef(null)
    const appMountFunction = window.NAVSPA[exportName]

    useEffect(() => {
        if (rootMountRef.current) {
            appMountFunction(rootMountRef.current, {
                fetchActiveUserOnMount: true,
                onEnhetChanged: () => {},
                onFnrChanged: onFnrChanged,
                showSearchArea: true,
                showEnheter: false,
                appName: "Arbeidsrettet oppfølging",
                environment: "q2",
                urlFormat:
                    getEnv().ingressType === "ansatt" ? "ANSATT" : "NAV_NO",
                showHotkeys: false,
                proxy: "/api/modiacontextholder",
            })
        }
    })

    return <div ref={rootMountRef}></div>
}

const DecoratorPlaceholder = () => {
    return <div className="bg-gray-900 h-[48px]"></div>
}

const Decorator = ({ onFnrChanged }: { onFnrChanged: OnFnrChanged }) => {
    return (
        <ClientOnlyChild placeholder={<DecoratorPlaceholder />}>
            <InternarbeidsflateDecorator onFnrChanged={onFnrChanged} />
        </ClientOnlyChild>
    )
}
export default Decorator
