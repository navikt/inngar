import { EnvType, getEnv } from "~/util/envUtil"

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data?: Record<string, any>) => void
        }
    }
}

const env = getEnv()
export const umamiWebsiteId =
    env.type === EnvType.local
        ? "41187a92-9c2f-420e-a55d-32f63d0f42c6"
        : env.type === EnvType.prod
            ? "c95a40cb-8c0f-43a5-9768-dfff0c21c037"
            : "41187a92-9c2f-420e-a55d-32f63d0f42c6"

export const logEvent = (eventName: string, eventProperties: Record<string, any> = {}) => {
    if (env.type === EnvType.local) {
        console.log("Umami localhost event:", eventName, eventProperties)
        // return
    }

    if (!window.umami) {
        console.warn("Umami ikke lastet ennå for event:", eventName)
        return
    }

    try {
        console.log("Sender event til Umami:", eventName, eventProperties)
        window.umami.track(eventName, { ...eventProperties, app: "start-arbeidsoppfolging" })
    } catch (e) {
        console.warn("Feil ved Umami tracking:", e)
    }
}

export const loggBesok = () => {
    logEvent("start-arbeidsoppfolging.besok")
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

export const loggLenkeKlikket = (lenketekst: string) => {
    logEvent("lenke klikket", { lenketekst })
}

export const loggAlertVist = (
    variant: string,
    kanStarteOppfolging: string | "INGEN_BRUKER_VALGT",
) => {
    logEvent("alert vist", { variant, tekst: kanStarteOppfolging })
}

export const loggKnappKlikket = (knappTekst: string) =>
    logEvent("knapp klikket", { tekst: knappTekst })
