import { getEnv } from "~/util/envUtil.client"

export const getOversiktenLink = () => {
    const env = getEnv()
    return env.type === "prod"
        ? "https://veilarbportefoljeflate.intern.nav.no"
        : `https://veilarbportefoljeflate.${env.ingressType}.dev.nav.no`
}

export const getVeilarbpersonflateUrl = () => {
    const env = getEnv()
    return env.type === "prod"
        ? "https://veilarbpersonflate.intern.nav.no"
        : `https://veilarbpersonflate.${env.ingressType}.dev.nav.no`
}
