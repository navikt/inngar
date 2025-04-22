import { EnvType, getEnv } from "~/util/envUtil"

export const getOversiktenLink = () => {
    const env = getEnv()
    return env.type === EnvType.prod
        ? "https://veilarbportefoljeflate.intern.nav.no"
        : `https://veilarbportefoljeflate.${env.ingressType}.dev.nav.no`
}

export const getVeilarbpersonflateUrl = () => {
    const env = getEnv()
    return env.type === EnvType.prod
        ? "https://veilarbpersonflate.intern.nav.no"
        : `https://veilarbpersonflate.${env.ingressType}.dev.nav.no`
}
