import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

describe("static hosting contract", () => {
  it("ships routing, security, cache, and discovery configuration", async () => {
    const [config, robots, sitemap, notFound] = await Promise.all([
      read("public/staticwebapp.config.json"), read("public/robots.txt"), read("public/sitemap.xml"), read("site/404.html")
    ]);
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("https://api.github.com");
    expect(config).toContain("max-age=31536000, immutable");
    expect(config).toContain('"404"');
    expect(robots).toContain("Sitemap:");
    expect(sitemap).toContain("/demo/");
    expect(notFound).toContain("Page not found");
  });

  it("keeps unit test discovery independent of shell glob expansion", async () => {
    const packageJson = JSON.parse(await read("package.json")) as { scripts: { test: string } };
    expect(packageJson.scripts.test).toBe("vitest run");
    expect(await read("vitest.config.ts")).toContain('include: ["tests/*.test.ts"]');
  });

  it("ships complete route metadata and the shared route shell", async () => {
    const routes = await Promise.all(["site/index.html", "site/demo/index.html", "site/privacy/index.html", "site/terms/index.html", "site/404.html"].map(read));
    for (const page of routes) {
      expect(page).toContain('rel="canonical"');
      expect(page).toContain('property="og:title"');
      expect(page).toContain('property="og:image"');
      expect(page).toContain('name="twitter:card"');
      expect(page).toContain('rel="apple-touch-icon"');
      expect(page).toContain('aria-label="Main navigation"');
      expect(page).toContain('aria-label="Footer navigation"');
      expect(page).toContain('src="/route-focus.ts"');
    }
  });

  it("@claim:mit-license ships the promised MIT license", async () => {
    expect(await read("LICENSE")).toContain("Permission is hereby granted, free of charge");
  });
});
