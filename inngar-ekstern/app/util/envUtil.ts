import { EnvType } from "common"

export const envUtil = (): EnvType => {
  if (typeof window === "undefined") {
    // Server-side
    const cluster = process.env.NAIS_CLUSTER_NAME
    if (cluster === "prod-gcp") return EnvType.prod
    if (cluster === "dev-gcp") return EnvType.dev
    return EnvType.local
  } else {
    // Client-side
    const { hostname } = window.location
    if (
      hostname.includes("intern.dev.nav.no") ||
      hostname.includes("ekstern.dev.nav.no")
    )
      return EnvType.dev
    if (hostname.includes("nav.no")) return EnvType.prod
    return EnvType.local
  }
}
