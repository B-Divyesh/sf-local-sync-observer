import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist/site"),
    emptyOutDir: true,
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, "site/index.html"),
        demo: resolve(__dirname, "site/demo/index.html"),
        privacy: resolve(__dirname, "site/privacy/index.html"),
        terms: resolve(__dirname, "site/terms/index.html")
      }
    }
  }
});
