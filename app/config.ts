import { apps, toAppUrl } from "~/util/appConstants"
import { getEnv } from "~/util/envUtil.client"

const contextHolderApiUrl = toAppUrl(apps.modiacontextholder, "/api/context/v2")
export const aktivBrukerUrl = `${contextHolderApiUrl}/aktivbruker`
export const aktivEnhetUrl = `${contextHolderApiUrl}/aktivenhet`

export const getOversiktenLink = () => {
    const env = getEnv()
    return env.type === "prod"
        ? "https://veilarbportefoljeflate.intern.nav.no"
        : `https://veilarbportefoljeflate.${env.ingressType}.dev.nav.no`
}
