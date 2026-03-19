import { EnvType, getEnv } from "~/util/envUtil"

export const getOversiktenLink = () => {
    const env = getEnv()
    return env.type === EnvType.dev || env.type === EnvType.local
        ? `https://veilarbportefoljeflate.${env.ingressType}.dev.nav.no`
        : "https://veilarbportefoljeflate.intern.nav.no"
}

export const getVeilarbpersonflateUrl = () => {
    const env = getEnv()
    return env.type === EnvType.dev || env.type === EnvType.local
        ? `https://veilarbpersonflate.${env.ingressType}.dev.nav.no`
        : "https://veilarbpersonflate.intern.nav.no"
}
