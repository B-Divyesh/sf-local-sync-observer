import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: [
    {
      command: "npm run build:site && npx vite preview --host 127.0.0.1 --port 4173 --outDir dist/site",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: true
    },
    {
      command: "npm run build:app && npx vite preview --host 127.0.0.1 --port 4174 --outDir dist/app",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: true
    }
  ],
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ]
});
