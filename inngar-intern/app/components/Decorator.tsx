import { EnvType, getEnv } from "~/util/envUtil"
import { ClientOnlyChild } from "~/util/remoteUtil"

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
    return (
        <internarbeidsflate-decorator
            app-name="Arbeidsrettet oppfølging"
            environment={env.type == EnvType.prod ? "prod" : "q2"}
            url-format={env.ingressType === "ansatt" ? "ANSATT" : "NAV_NO"}
            show-enheter={false}
            show-search-area={true}
            fetch-active-enhet-on-mount={false}
            fetch-active-user-on-mount
            // onEnhetChanged={() => {}}
            onFnrChanged={onFnrChanged}
            show-hotkeys={false}
            proxy={"/api/modiacontextholder"}
        >
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
