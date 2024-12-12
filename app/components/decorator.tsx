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

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}

const InternarbeidsflateDecorator = () => {
    const rootMountRef = useRef(null)
    const appMountFunction = window.NAVSPA[exportName]

    useEffect(() => {
        if (rootMountRef.current) {
            appMountFunction(rootMountRef.current, {
                fetchActiveUserOnMount: true,
                onEnhetChanged: () => {},
                onFnrChanged: () => {},
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

const Decorator = () => {
    return <ClientOnly App={InternarbeidsflateDecorator} />
}
export default Decorator