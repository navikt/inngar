import { init, track } from "@amplitude/analytics-browser"
import { EnvType, getEnv } from "~/util/envUtil"
import type {
    ArenaReponseKoder,
    KanStarteOppfolging,
} from "~/api/veilarboppfolging"

const env = getEnv()

const apiKey =
    env.type === EnvType.local
        ? ""
        : env.type === EnvType.prod
          ? "691963e61d2b11465aa96acfcaa8959b"
          : "faf28eb5445abfe75c7ac28ae7a8d050"

const AMPLITUDE_API_KEY = apiKey

if (env.type != EnvType.local) {
    init(AMPLITUDE_API_KEY, undefined, {
        autocapture: true,
        serverUrl: "https://amplitude.nav.no/collect",
        ingestionMetadata: {
            sourceName: window.location.toString(),
        },
    })
}

const logEvent = (eventName: string, eventProperties: Record<string, any>) => {
    track(eventName, {
        ...eventProperties,
        app: "start-arbeidsoppfolging",
    })
}
export const loggBesok = () => {
    logEvent("start-arbeidsoppfolging.besok", {})
}

export const loggSkjemaFullført = (arenaStatus: ArenaReponseKoder) => {
    logEvent("skjema fullført", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus: arenaStatus,
    })
}

export const loggSkjemaFeilet = (arenaStatus: ArenaReponseKoder) => {
    logEvent("skjema innsending feilet", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        arenaStatus: arenaStatus,
    })
}

export const loggLenkeKlikket = (lenketekst: string) => {
    logEvent("lenke klikket", {
        lenketekst: lenketekst,
    })
}

export const loggAlertVist = (
    variant: string,
    kanStarteOppfolging: KanStarteOppfolging | "INGEN_BRUKER_VALGT",
) => {
    logEvent("alert vist", {
        variant,
        tekst: kanStarteOppfolging,
    })
}

export const loggKnappKlikket = (knappTekst: string) =>
    logEvent("knapp klikket", {
        tekst: knappTekst,
    })
