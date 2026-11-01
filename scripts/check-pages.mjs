import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { routes } from '../.ssr/entry-server.js';
const base = process.env.APEX_BASE_PATH || '/';
const site = process.env.APEX_SITE_URL?.replace(/\/+$/, '');
const titles = new Set();
let checkedResources = 0;
async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
async function checkLocal(url) {
  if (!url || url.startsWith('#') || /^[a-z]+:/i.test(url) || url.startsWith('//')) return;
  assert(url.startsWith(base), `Resource or link outside base path: ${url}`);
  const relative = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
  const file = join('dist', relative);
  assert(await exists(file) || await exists(join(file, 'index.html')), `Missing target: ${url}`);
  checkedResources++;
}
for (const route of routes) {
  const html = await readFile(join('dist', route, 'index.html'), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `Missing or duplicate title: ${route}`); titles.add(title);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `Invalid h1 count: ${route}`);
  assert(!/\b(?:src|href)="\/(?:images|fonts|assets)\//.test(html) || base === '/', 'Unprefixed resource');
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) await checkLocal(match[1]);
  for (const match of html.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) await checkLocal(candidate.trim().split(/\s+/)[0]);
  }
  if (site) {
    const expected = `${site}${route === '/' ? '/' : `${route}/`}`;
    assert(html.includes(`rel="canonical" href="${expected}"`), `Bad canonical: ${route}`);
    assert(html.includes(`content="${site}/og-cover.jpg"`), `Bad Open Graph image: ${route}`);
  }
}
for (const name of await readdir('dist/assets')) {
  if (extname(name) !== '.css') continue;
  const css = await readFile(join('dist/assets', name), 'utf8');
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) await checkLocal(match[1].replace(/["']/g, ''));
}
assert(await exists('dist/.nojekyll'));
assert((await readFile('dist/404.html', 'utf8')).includes('data-page="404"'));
if (site) assert.equal(((await readFile('dist/sitemap.xml', 'utf8')).match(/<loc>/g) || []).length, routes.length);
console.log(`PASS: ${routes.length} static routes, ${checkedResources} links/resources, fonts, 404, .nojekyll${site ? ', sitemap and canonical URLs' : ''}; base=${base}`);
