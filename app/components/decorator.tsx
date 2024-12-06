import React, {useEffect, useRef, useState} from "react";
import type {DecoratorProps} from "~/components/decoratorProps";

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

const InternarbeidsflateDecorator = () => {
    const rootMountRef = useRef()
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
            })
        }
    })

    return <div ref={rootMountRef} > </div>
}

const Decorator = () => {
    return <ClientOnly App={InternarbeidsflateDecorator} />
}
export default Decorator