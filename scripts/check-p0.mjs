import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const names = ['pachete-turistice.html', 'charter-craiova.html', 'vacanta-de-vara-craiova-2026.html', 'vacante-mallorca-palma-craiova-2026.html'];
const pages = Object.fromEntries(await Promise.all(names.map(async name => [name, await fs.readFile(path.join(root, name), 'utf8')])));

for (const [name, html] of Object.entries(pages)) {
  assert.ok(/<html\b[^>]*lang="ro"/i.test(html), `${name}: limba`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${name}: un H1`);
  assert.ok(/<link\b[^>]*rel="canonical"/i.test(html), `${name}: canonical`);
  if (name !== 'charter-craiova.html') {
    assert.ok(/<main\b/i.test(html), `${name}: main`);
    assert.ok(/<\/main>/i.test(html), `${name}: închidere main`);
  }
  assert.ok(/<\/html>/i.test(html), `${name}: închidere html`);
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) JSON.parse(match[1]);
  for (const match of html.matchAll(/href="([^"#]+?\.html)(?:#[^"]*)?"/gi)) {
    if (/^https?:/.test(match[1])) continue;
    await fs.access(path.join(root, match[1]));
  }
}

const offers = pages['pachete-turistice.html'];
assert.doesNotMatch(offers, /Tarife preluate|20\.07\.2026|3\.362 EUR|3\.478 EUR|3\.518 EUR/);
const charter = pages['charter-craiova.html'];
assert.doesNotMatch(charter, /de la (?:299|399|249) EUR|Charter zilnic|Transport organizat din Craiova inclus|Totul organizat și inclus/);
const mallorca = pages['vacante-mallorca-palma-craiova-2026.html'];
assert.doesNotMatch(mallorca, /529 EUR|1\.058 EUR|02:30|04:10|4 septembrie 2026|12 iunie 2026|în fiecare joi/i);
assert.match(mallorca, /Programul charter din vara 2026 s-a încheiat/);
const summer = pages['vacanta-de-vara-craiova-2026.html'];
assert.doesNotMatch(summer, /529 EUR|joi din CRA|Suntem in plin sezon|Suntem deja in sezon|charter joi din Craiova/i);
assert.match(summer, /Sezonul de vară 2026 s-a încheiat/);

const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const name of names) assert.match(sitemap, new RegExp(`<loc>https://agentuldevacante\\.ro/${name.replaceAll('.', '\\.')}<\\/loc>\\s*<lastmod>2026-09-23<\\/lastmod>`));

console.log('P0 OK: HTML, JSON-LD, linkuri locale, afirmații expirate și sitemap.');
