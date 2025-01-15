import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
    index("routes/index.tsx"),
    route("/api/modiacontextholder/*", "routes/dekoratorProxy.tsx"),
    route("/metrics", "routes/metrics.tsx"),
    route("/internal/isAlive", "routes/isAlive.tsx"),
    route("/internal/isReady", "routes/isReady.tsx"),
    route("*", "routes/redirectToIndex.tsx"),
] satisfies RouteConfig
