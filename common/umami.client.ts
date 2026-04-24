import { EnvType } from "./env.ts"

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data?: Record<string, any>) => void
        }
    }
}

declare const window: any
declare const document: any

const isBrowser = typeof window !== "undefined"

const sporingskode = (env: EnvType): string => {
    if (typeof window === "undefined") {
        return ""
    } else {
        const { hostname } = window.location

        if (env === EnvType.dev) {
            const intern =
                hostname.includes("intern.dev.nav.no") ||
                hostname.includes("ansatt.dev.nav.no")
            return intern
                ? "41187a92-9c2f-420e-a55d-32f63d0f42c6"
                : "8b1f90af-0a2a-4b75-b486-ca24a277dfb5"
        } else if (env === EnvType.prod) {
            const intern = hostname.includes("intern.nav.no")
            return intern
                ? "c95a40cb-8c0f-43a5-9768-dfff0c21c037"
                : "3c28efee-60ed-44f7-94fb-b8a5e82f0216"
        } else {
            return ""
        }
    }
}

const umamiSettings = (
    env: EnvType,
): Record<
    EnvType,
    { sporingskode: string; host: string; scriptSrc: string }
> => ({
    [EnvType.local]: { sporingskode: "", host: "", scriptSrc: "" },
    [EnvType.dev]: {
        sporingskode: sporingskode(env),
        host: "https://reops-event-proxy.ekstern.dev.nav.no",
        scriptSrc: "https://cdn.nav.no/team-researchops/sporing/sporing-dev.js",
    },
    [EnvType.prod]: {
        sporingskode: sporingskode(env),
        host: "https://reops-event-proxy.nav.no",
        scriptSrc: "https://cdn.nav.no/team-researchops/sporing/sporing.js",
    },
})

let env: EnvType = EnvType.local

export async function loadUmami(envType: EnvType): Promise<void> {
    env = envType
    if (!isBrowser || env === EnvType.local) return
    if (window.umami) return
    const settings = umamiSettings(env)

    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.defer = true
        script.setAttribute("data-host-url", settings[env].host)
        script.setAttribute("data-website-id", settings[env].sporingskode)
        script.setAttribute("data-tag", "start-arbeidsoppfolging")
        script.src = settings[env].scriptSrc

        script.onload = () => {
            if (window.umami) {
                resolve()
            } else {
                console.debug(
                    "Umami script lastet, men window.umami er undefined.",
                    document.querySelector('script[src*="sporing.js"]'),
                )
                reject(
                    new Error(
                        "Umami script lastet, men window.umami er undefined",
                    ),
                )
            }
        }

        script.onerror = () =>
            reject(new Error("Feil ved lasting av umami script"))

        document.head.appendChild(script)
    })
}

const logEvent = (
    eventName: string,
    eventProperties: Record<string, any> = {},
) => {
    if (!isBrowser) return

    if (env === EnvType.local) {
        console.log("Umami localhost event:", eventName, eventProperties)
        return
    }

    try {
        console.log("Sender event til Umami:", eventName, eventProperties)
        window.umami?.track(eventName, {
            ...eventProperties,
        })
    } catch (e) {
        console.warn("Feil ved Umami tracking:", e)
    }
}

export const loggBesok = () => {
    logEvent("besok")
}

export const loggBesokUnder18 = () => {
    logEvent("besøk av bruker under 18 år")
}

export const loggSkjemaFullført = (arenaStatus: string) => {
    logEvent("skjema fullført", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus,
    })
}

export const loggSkjemaFeilet = (arenaStatus: string) => {
    logEvent("skjema innsending feilet", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus,
    })
}

export const loggLenkeKlikket = (lenketekst: string) =>
    logEvent("lenke klikket", { lenketekst })

export const loggAlertVist = (
    variant: string,
    kanStarteOppfolging: string | "INGEN_BRUKER_VALGT",
) => {
    logEvent("alert vist", { variant, tekst: kanStarteOppfolging })
}

export const loggKnappKlikket = (knappTekst: string) =>
    logEvent("knapp klikket", { tekst: knappTekst })
