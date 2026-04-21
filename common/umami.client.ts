import { EnvType, getEnv } from "./envUtil.ts"

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data?: Record<string, any>) => void;
        }
    }
}

declare const window: any
declare const document: any

const isBrowser = typeof window !== "undefined"
const env = getEnv()

const sporingskode = (): string => {
    if (typeof window === "undefined") {
        return ""
    } else {
        const { hostname } = window.location

        if (env.type === EnvType.dev) {
            const intern = hostname.includes("intern.dev.nav.no") || hostname.includes("ansatt.dev.nav.no")
            return intern ? "41187a92-9c2f-420e-a55d-32f63d0f42c6" : "LEGG-INN"
        } else if (env.type === EnvType.prod) {
            const intern = hostname.includes("intern.nav.no")
            return intern ? "c95a40cb-8c0f-43a5-9768-dfff0c21c037" : "3c28efee-60ed-44f7-94fb-b8a5e82f0216"
        } else {
            return ""
        }
    }
}

const umamiSettings: Record<EnvType, { sporingskode: string, host: string, scriptSrc: string }> = {
    [EnvType.local]: { sporingskode: "", host: "", scriptSrc: "" },
    [EnvType.dev]: {sporingskode: sporingskode(), host: "https://reops-event-proxy.ekstern.dev.nav.no", scriptSrc: "https://cdn.nav.no/team-researchops/sporing/sporing-dev.js"},
    [EnvType.prod]: {sporingskode: sporingskode(), host: "https://reops-event-proxy.nav.no", scriptSrc: "https://cdn.nav.no/team-researchops/sporing/sporing.js"},
}

export const umamiWebsiteId = umamiSettings[env.type].sporingskode ?? ""


export async function loadUmami(): Promise<void> {
    if (!isBrowser || env.type === EnvType.local) return
    if (window.umami) return

    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.defer = true
        script.setAttribute("data-host-url", umamiSettings[env.type].host)
        script.setAttribute("data-website-id", umamiWebsiteId)
        script.setAttribute("data-tag", "start-arbeidsoppfolging")
        script.src = umamiSettings[env.type].scriptSrc

        script.onload = () => {
            if (window.umami) {
                resolve()
            } else {
                console.debug(
                    "Umami script lastet, men window.umami er undefined.",
                    document.querySelector("script[src*=\"sporing.js\"]")
                )
                reject(new Error("Umami script lastet, men window.umami er undefined"))
            }
        }

        script.onerror = () => reject(new Error("Feil ved lasting av umami script"))

        document.head.appendChild(script)
    })
}

export const logEvent = (
    eventName: string,
    eventProperties: Record<string, any> = {}
) => {
    if (!isBrowser) return

    if (env.type === EnvType.local) {
        console.log("Umami localhost event:", eventName, eventProperties)
        return
    }

    try {
        console.log("Sender event til Umami:", eventName, eventProperties)
        window.umami?.track(eventName, {
            ...eventProperties,
            app: "start-arbeidsoppfolging",
            appNavn: "inngar"
        })
    } catch (e) {
        console.warn("Feil ved Umami tracking:", e)
    }
}

export const loggBesok = () => {
    logEvent("besok", { appNavn: "inngar" })
}

export const loggSkjemaFullført = (arenaStatus: string) => {
    logEvent("skjema fullført", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus
    })
}

export const loggSkjemaFeilet = (arenaStatus: string) => {
    logEvent("skjema innsending feilet", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus
    })
}

export const loggLenkeKlikket = (lenketekst: string) =>
    logEvent("lenke klikket", { lenketekst })

export const loggAlertVist = (
    variant: string,
    kanStarteOppfolging: string | "INGEN_BRUKER_VALGT"
) => {
    logEvent("alert vist", { variant, tekst: kanStarteOppfolging })
}

export const loggKnappKlikket = (knappTekst: string) =>
    logEvent("knapp klikket", { tekst: knappTekst })
