import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const packageVersion = (JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string }).version;
const sourceCommit = process.env.LSO_SOURCE_COMMIT ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();

if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error("LSO_SOURCE_COMMIT must be a full Git commit SHA");

export default defineConfig({
  root: ".",
  publicDir: false,
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
    __SOURCE_COMMIT__: JSON.stringify(sourceCommit)
  },
  build: {
    outDir: "dist/app",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true }
});
