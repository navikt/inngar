import {useEffect, useRef, useState} from "react";
import type {DecoratorProps} from "~/components/decoratorProps";
import type {Route} from "../../.react-router/types/app/routes/+types";
import {logger} from "~/logger";

const exportName = "internarbeidsflate-decorator-v3"

declare const window: {
    NAVSPA: {
        'internarbeidsflate-decorator-v3': (node: HTMLElement, props: DecoratorProps) => React.ReactElement,
    }
}

const ClientOnly = ({ App }: {  }) => {
    const [rendered, setRendered] = useState(false)
    useEffect(() => {
        setRendered(true)
    }, [])
    return rendered ? <App /> : <div>Ikke noe decorator :(</div>
}

const ClientOnlyChild = ({ children }: { children:any }) => {
    const [rendered, setRendered] = useState(false)
    useEffect(() => {
        setRendered(true)
    }, [])
    if (rendered) return children
    else return null
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}

type OnFnrChanged = (fnr?: string | null | undefined) => void

const InternarbeidsflateDecorator = ({ onFnrChanged }: { onFnrChanged: OnFnrChanged }) => {
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
                appName: "Arbeidsoppfolging registrering",
                environment: 'q2',
                urlFormat: "ANSATT",
                showHotkeys: false,
                proxy: '/api/modiacontextholder'
            })
        }
    })

    return <div ref={rootMountRef} > </div>
}

const Decorator = ({ onFnrChanged }: { onFnrChanged: OnFnrChanged }) => {
    // return <ClientOnly App={InternarbeidsflateDecorator} />
    return <ClientOnlyChild >
        <InternarbeidsflateDecorator onFnrChanged={onFnrChanged} />
    </ClientOnlyChild>
}
export default Decorator