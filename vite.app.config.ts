import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: false,
  build: {
    outDir: "dist/app",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true }
});
