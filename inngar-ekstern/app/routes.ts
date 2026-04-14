import { index, route, type RouteConfig } from "@react-router/dev/routes"

const devRoutes = import.meta.env.DEV
    ? [route("/mock-settings", "routes/mockSettings.ts")]
    : []

export default [
    index("routes/home.tsx"),
    route("/internal/isAlive", "routes/isAlive.tsx"),
    route("/internal/isReady", "routes/isReady.tsx"),
    route("*", "routes/notFound.tsx"),
    ...devRoutes,
] satisfies RouteConfig;
