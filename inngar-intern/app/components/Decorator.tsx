import { ClientOnlyChild } from "~/util/remoteUtil"
import { EnvType } from "common"
import { getEnv } from "~/util/envUtil.ts"
import { useLayoutEffect, useRef } from "react"

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
    const decoratorRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        console.log("Kjører useLayoutEffect")
        const el = decoratorRef.current;
        if (!el) return;
        console.log("Kan sette opp lyttere");
        const handleFnrChanged = (e: Event) => {
            const { fnr } = (e as CustomEvent).detail;
            console.log("onFnrChanged", fnr);
            onFnrChanged(fnr);
        };
        el.addEventListener('fnr-changed', handleFnrChanged);
        return () => {
            el.removeEventListener('fnr-changed', handleFnrChanged);
        };
    }, []);


    return (
        <internarbeidsflate-decorator
            ref={decoratorRef}
            app-name="Arbeidsrettet oppfølging"
            environment={env.type == EnvType.prod ? "prod" : "q2"}
            url-format={env.ingressType === "ansatt" ? "ANSATT" : "NAV_NO"}
            show-enheter={false}
            show-search-area={true}
            fetch-active-enhet-on-mount={false}
            fetch-active-user-on-mount={true}
            // onEnhetChanged={() => {}}
            // onFnrChanged={onFnrChanged}
            show-hotkeys={false}
            proxy={"/api/modiacontextholder"}>
            <DecoratorPlaceholder />
        </internarbeidsflate-decorator>
    )
    // return <div className="bg-gray-900 min-h-[48px]" ref={rootMountRef}></div>
}

const Decorator = ({ onFnrChanged }: { onFnrChanged: OnFnrChanged }) => {
    return (
        <div className="bg-ax-border-focus min-h-[48px]">
            <ClientOnlyChild placeholder={<DecoratorPlaceholder />}>
                <InternarbeidsflateDecorator onFnrChanged={onFnrChanged} />
            </ClientOnlyChild>
        </div>
    )
}
export default Decorator
