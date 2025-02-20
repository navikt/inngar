import { init, track } from "@amplitude/analytics-browser"
import { EnvType, getEnv } from "~/util/envUtil.client"

const apiKey =
    getEnv().type === EnvType.local
        ? "faf28eb5445abfe75c7ac28ae7a8d050"
        : getEnv().type === EnvType.prod
          ? "691963e61d2b11465aa96acfcaa8959b"
          : "faf28eb5445abfe75c7ac28ae7a8d050"

const AMPLITUDE_API_KEY = apiKey

init(AMPLITUDE_API_KEY, undefined, {
    autocapture: true,
    serverUrl: "https://amplitude.nav.no/collect",
    ingestionMetadata: {
        sourceName: window.location.toString(),
    },
})

const logEvent = (eventName: string, eventProperties: Record<string, any>) => {
    track(eventName, {
        ...eventProperties,
        origin: "start-arbeidsoppfolging",
    })
}
export const loggBesok = () => {
    logEvent("start-arbeidsoppfolging.besok", {})
}
export const loggSkjemaFullført = () => {
    logEvent("skjema-fullfort", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
    })
}
export const loggSkjemaFeilet = (reason: string) => {
    logEvent("skjema innsending feilet", {
        skjemanavn: "start-arbeidsoppfolging",
        skjemaId: "start-arbeidsoppfolging",
        feil: reason,
    })
}
