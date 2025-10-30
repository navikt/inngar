import { EnvType, getEnv } from "~/util/envUtil"

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data?: Record<string, any>) => void;
        }
    }
}

const env = getEnv()

const umamiWebsiteIds: Record<EnvType, string> = {
    [EnvType.local]: "",
    [EnvType.dev]: "41187a92-9c2f-420e-a55d-32f63d0f42c6",
    [EnvType.prod]: "c95a40cb-8c0f-43a5-9768-dfff0c21c037"
}

export const umamiWebsiteId = umamiWebsiteIds[env.type] ?? ""


export async function loadUmami(): Promise<void> {
    if (env.type === EnvType.local) return
    if (window.umami) return

    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.defer = true
        script.setAttribute("data-host-url", "https://umami.nav.no")
        script.setAttribute("data-website-id", umamiWebsiteId)
        script.setAttribute("data-tag", "start-arbeidsoppfolging")
        script.src = "https://cdn.nav.no/team-researchops/sporing/sporing.js"

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
    if (env.type === EnvType.local) {
        console.log("Umami localhost event:", eventName, eventProperties)
        return
    }

    try {
        console.log("Sender event til Umami:", eventName, eventProperties)
        window.umami?.track(eventName, {
            ...eventProperties,
            app: "start-arbeidsoppfolging"
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
        appNavn: "inngar",
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus
    })
}

export const loggSkjemaFeilet = (arenaStatus: string) => {
    logEvent("skjema innsending feilet", {
        appNavn: "inngar",
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
