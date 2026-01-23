import { reactRouter } from "@react-router/dev/vite"
import autoprefixer from "autoprefixer"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    css: {
        postcss: {
            plugins: [autoprefixer],
        },
    },
    plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
    optimizeDeps: {
        include: ["@opentelemetry/api"],
    },
    ssr: {
        noExternal: ["@opentelemetry/api"],
    },
})
