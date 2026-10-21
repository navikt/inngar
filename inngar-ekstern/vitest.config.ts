import { defineConfig } from "vitest/config"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [svgr()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    restoreMocks: true,
  },
})
