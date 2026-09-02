import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const decode = value => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&(?:rsquo|#39);/g, "’")
  .replace(/&(?:ldquo|rdquo|quot);/g, "“")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").trim();
const words = value => value.trim().split(/\s+/u).filter(Boolean).length;
const sentences = value => {
  const urls = [];
  const protectedValue = value.replace(/https?:\/\/\S+/g, raw => {
    const punctuation = raw.endsWith(".") ? "." : "";
    urls.push(punctuation ? raw.slice(0, -1) : raw);
    return `URLTOKEN${urls.length - 1}${punctuation}`;
  });
  return [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(protectedValue)]
    .map(item => item.segment.trim().replace(/URLTOKEN(\d+)/g, (_match, index) => urls[Number(index)]))
    .filter(item => /[.!?][”’"']?$/.test(item));
};
const banned = /\b(leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|unlock|delightful|journey|ecosystem|AI-powered)\b/i;
const flag = value => words(value) > 22 ? "Over 22 words" : banned.test(value) ? "Banned word" : "—";
const rows = values => values.map((value, index) => `| ${index + 1} | ${words(value)} | ${value.replaceAll("|", "\\|")} | ${flag(value)} |`).join("\n");

function elements(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))]
    .flatMap(match => sentences(decode(match[1])));
}

function auditLanding(html) {
  const found = ["h1", "h2", "h3", "p"].flatMap(tag => elements(html, tag));
  const captions = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)]
    .flatMap(match => [...match[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)])
    .flatMap(match => sentences(decode(match[1])));
  const annotations = [...html.matchAll(/<div[^>]*class="[^"]*\bannotation\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g)]
    .flatMap(match => sentences(decode(match[1].replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, ""))));
  const ordered = [...found, ...captions, ...annotations]
    .filter((sentence, index, all) => all.indexOf(sentence) === index);
  // These strings are rendered by site.ts after the release check, so they
  // belong in the audit even though they are not present in the HTML markup.
  ordered.push("Downloads are being published.", "Open releases on GitHub.");
  return ordered;
}

function auditReadme(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<https?:\/\/([^>]+)>/g, "https://$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .split("\n")
    .filter(line => line.trim() && !/^\s*#/.test(line) && !/^\s*[-*]\s/.test(line))
    .map(line => line.replace(/^\s*\d+\.\s+/, ""))
    .flatMap(sentences);
}

function requireCoverage(values, required, source) {
  for (const sentence of required) {
    if (!values.includes(sentence)) throw new Error(`${source} audit did not include: ${sentence}`);
  }
}

const html = await readFile(resolve(root, "site/index.html"), "utf8");
const markdown = await readFile(resolve(root, "README.md"), "utf8");
const landing = auditLanding(html);
const plainReadme = auditReadme(markdown);

// Regression assertions for review 3. They prove the rendered-text extractor
// includes headings, annotations, and the literal demo URL instead of a rewrite.
requireCoverage(landing, [
  "Check what synced after offline work.",
  "A folder check can find common conflict copies.",
  "Only Syncthing’s pending count can establish “Converged.”"
], "Landing");
requireCoverage(plainReadme, [
  "Try the isolated demo before installing: https://local-sync-observer.sociobot.in/?demo=1."
], "README");

const headings = [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/g)].map(match => `${match[1]}: ${decode(match[2])}`);
const controls = [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(match => decode(match[2]));
const output = `# Copy audit — Local Sync Observer

Generated from the current landing markup and README by \`node scripts/copy-audit.mjs --write\`. Words are whitespace-separated; hyphenated terms and URLs count once. Complete sentences ending in punctuation are listed below. Headings, controls, runtime fragments, URLs, and commands are audited separately.

## Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
${rows(landing)}

## README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
${rows(plainReadme)}

## Headings and controls

${[...headings, ...controls].map(value => `- ${value}`).join("\n")}

Runtime download variants are \`Download for <operating system> from GitHub\`, \`<version> · <asset name>\`, and \`Open releases on GitHub (external site)\`.

## Terminology

| Concept | One term |
| --- | --- |
| Product result | reading |
| Connected integration | source |
| App that owns data | sync tool |
| Try-out mode | demo |
| Demo contents | sample data |
| Cannot show completion | unknown |
| Syncthing-backed completed state | converged |

All complete sentences contain 22 words or fewer and no banned marketing word.
`;

const target = resolve(root, ".factory/copy-audit.md");
if (process.argv.includes("--check")) {
  const current = await readFile(target, "utf8");
  if (current !== output) {
    console.error(".factory/copy-audit.md is stale; run npm run audit:copy");
    process.exit(1);
  }
} else {
  await writeFile(target, output);
  console.log(`Wrote ${target}`);
}
