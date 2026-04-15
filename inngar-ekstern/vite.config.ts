import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import svgr from "vite-plugin-svgr"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [tailwindcss(), svgr(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
})
