export enum Env {
  prod = "prod",
  dev = "dev",
  local = "local",
}

export const getEnv = (): Env => {
  if (typeof window === "undefined") {
    // Server-side
    const cluster = process.env.NAIS_CLUSTER_NAME
    if (cluster === "prod-gcp") return Env.prod
    if (cluster === "dev-gcp") return Env.dev
    return Env.local
  } else {
    // Client-side
    const { hostname } = window.location
    if (
      hostname.includes("intern.dev.nav.no") ||
      hostname.includes("ekstern.dev.nav.no")
    )
      return Env.dev
    if (hostname.includes("nav.no")) return Env.prod
    return Env.local
  }
}
