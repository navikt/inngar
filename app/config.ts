import { apps, toAppUrl } from "~/util/appConstants"

const contextHolderApiUrl = toAppUrl(apps.modiacontextholder, "")
export const aktivBrukerUrl = `${contextHolderApiUrl}/api/context/v2/aktivbruker`
export const aktivEnhetUrl = `${contextHolderApiUrl}/api/context/v2/aktivenhet`
export const generateFnrCodeUrl = `${contextHolderApiUrl}/fnr-code/generate`
export const retrieveFnrUrl = `${contextHolderApiUrl}/fnr-code/retrieve`
