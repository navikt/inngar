import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("/internal/isAlive", "routes/isAlive.tsx"), route("/internal/isReady", "routes/isReady.tsx")] satisfies RouteConfig;
