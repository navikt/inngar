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
        const decoratorElement = decoratorRef.current;
        if (!decoratorElement) return;
        const handleFnrChanged = (e: Event) => {
            const { fnr } = (e as CustomEvent).detail;
            onFnrChanged(fnr);
        };
        decoratorElement.addEventListener('fnr-changed', handleFnrChanged);
        return () => {
            decoratorElement.removeEventListener('fnr-changed', handleFnrChanged);
        };
    }, []);


    return (
        <internarbeidsflate-decorator
            ref={decoratorRef}
            app-name="Arbeidsrettet oppfølging"
            environment={env.type == EnvType.prod ? "prod" : "q2"}
            url-format={env.type === EnvType.local ? "LOCAL" : "ANSATT"}
            show-enheter={false}
            show-search-area={true}
            fetch-active-enhet-on-mount={false}
            fetch-active-user-on-mount={true}
            show-hotkeys={false}
            proxy={"/api/modiacontextholder"}>
            <DecoratorPlaceholder />
        </internarbeidsflate-decorator>
    )
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
