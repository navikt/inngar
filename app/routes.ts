import { index, route, type RouteConfig } from "@react-router/dev/routes"

const devRoutes = import.meta.env.DEV
    ? [route("/mock-settings", "routes/mocksSettings.ts")]
    : []

export default [
    index("routes/ingenBrukerValgtPage.tsx", { id: "registrering" }),
    route("/:fnrCode", "routes/startOppfolgingPaBrukerPage.tsx", {
        id: "registrering-fnr-code",
    }),
    route("/registrert", "routes/registrert.tsx"),
    route("/api/modiacontextholder/*", "routes/dekoratorProxy.tsx"),
    route("/metrics", "routes/metrics.tsx"),
    route("/internal/isAlive", "routes/isAlive.tsx"),
    route("/internal/isReady", "routes/isReady.tsx"),
    route("/veilarboppfolging/*", "routes/veilarbProxy.tsx", {
        id: "veilarboppfolging",
    }),
    route("/veilarbportefolje/*", "routes/veilarbProxy.tsx", {
        id: "veilarbportefolje",
    }),
    route("/veilarbperson/*", "routes/veilarbProxy.tsx", {
        id: "veilarbperson",
    }),
    route("/veilarbdialog/*", "routes/veilarbProxy.tsx", {
        id: "veilarbdialog",
    }),
    route("/veilarbveileder/*", "routes/veilarbProxy.tsx", {
        id: "veilarbveileder",
    }),
    route("/veilarbvedtaksstotte/*", "routes/veilarbProxy.tsx", {
        id: "veilarbvedtaksstotte",
    }),
    route("/obo-unleash/*", "routes/veilarbProxy.tsx", {
        id: "obo-unleash",
    }),
    ...devRoutes,
    route("*", "routes/redirectToIndex.tsx"),
] satisfies RouteConfig
