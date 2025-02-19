import { apps, toAppUrl } from "~/util/appConstants"

const contextHolderApiUrl = toAppUrl(apps.modiacontextholder, "/api/context/v2")
export const aktivBrukerUrl = `${contextHolderApiUrl}/aktivbruker`
export const aktivEnhetUrl = `${contextHolderApiUrl}/aktivenhet`
