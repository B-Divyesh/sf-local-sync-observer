import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

describe("static hosting contract", () => {
  it("ships routing, security, cache, and discovery configuration", async () => {
    const [config, robots, sitemap, notFound] = await Promise.all([
      read("public/staticwebapp.config.json"), read("public/robots.txt"), read("public/sitemap.xml"), read("public/404.html")
    ]);
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("https://api.github.com");
    expect(config).toContain("max-age=31536000, immutable");
    expect(config).toContain('"404"');
    expect(robots).toContain("Sitemap:");
    expect(sitemap).toContain("/demo/");
    expect(notFound).toContain("That page is not on this board.");
  });

  it("ships the required social, canonical, and icon metadata", async () => {
    const home = await read("site/index.html");
    expect(home).toContain('rel="canonical"');
    expect(home).toContain('property="og:image"');
    expect(home).toContain('name="twitter:card"');
    expect(home).toContain('rel="apple-touch-icon"');
  });
});
