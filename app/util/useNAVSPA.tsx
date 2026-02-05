import { useEffect, useState } from "react"
import type { DecoratorProps } from "~/components/DecoratorProps.ts"
import type { VisittKortProps } from "~/components/Visittkort.tsx"

declare const window: {
    NAVSPA: NAVSPAType | undefined
}

type MountFunction<Props> = (
    node: HTMLElement,
    props: Props,
) => React.ReactElement

type NavSpaApp = "internarbeidsflate-decorator-v3" | "veilarbvisittkortfs"

type Props = VisittKortProps | DecoratorProps

type NAVSPAType = {
    "internarbeidsflate-decorator-v3": MountFunction<DecoratorProps>
    veilarbvisittkortfs: MountFunction<VisittKortProps>
}
/**
 * Hook that waits for NAVSPA to be available on the window object.
 * Listens for the script load event instead of polling.
 * Returns the NAVSPA mount function when available, or null while waiting.
 */
const useNAVSPA = (app: NavSpaApp) => {
    const [navSpa, setNavSpa] = useState<
        | MountFunction<DecoratorProps>
        | MountFunction<VisittKortProps>
        | undefined
    >(undefined)

    useEffect(() => {
        // Already available
        if (window?.NAVSPA?.[app]) {
            // Wrap in arrow function - useState treats functions as functional updates
            setNavSpa(() => window.NAVSPA![app])
            return
        }

        // Poll every 100ms until NAVSPA is available
        const intervalId = setInterval(() => {
            if (window.NAVSPA?.[app]) {
                // Wrap in arrow function - useState treats functions as functional updates
                setNavSpa(() => window.NAVSPA![app])
                clearInterval(intervalId)
            }
        }, 100)

        return () => {
            clearInterval(intervalId)
        }
    }, [app])

    return navSpa
}

export const useVisittkortNavspa = ():
    | MountFunction<VisittKortProps>
    | undefined => useNAVSPA("veilarbvisittkortfs")
export const useDecorateNavspa = ():
    | MountFunction<DecoratorProps>
    | undefined => useNAVSPA("internarbeidsflate-decorator-v3")
