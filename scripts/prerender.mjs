import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render, routes } from '../.ssr/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const siteUrl = process.env.APEX_SITE_URL?.replace(/\/+$/, '');
if (siteUrl) {
  const parsed = new URL(siteUrl);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('APEX_SITE_URL must be a public HTTPS URL without credentials, query or fragment');
  }
}
const canonical = (path) => new URL(path.replace(/^\//, ''), `${siteUrl}/`).href;
for (const route of [...routes, '/404']) {
  const result = render(route);
  let html = template
    .replace('<div id="root"></div>', () => `<div id="root">${result.html}</div>`)
    .replace(/<title>.*?<\/title>/, () => `<title>${escape(result.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*/, (_, prefix) => prefix + escape(result.description))
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, (_, prefix) => prefix + escape(result.title))
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, (_, prefix) => prefix + escape(result.description));
  if (route === '/404') {
    html = html.replace('<div id="root">', '<div id="root" data-page="404">');
    html = html.replace('</head>', '<meta name="robots" content="noindex" /></head>');
  } else if (siteUrl) {
    const url = canonical(route === '/' ? '' : `${route}/`);
    html = html.replace('</head>', `<link rel="canonical" href="${escape(url)}" /><meta property="og:url" content="${escape(url)}" /></head>`);
  }
  if (siteUrl) {
    html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*/, (_, prefix) => prefix + escape(canonical('og-cover.jpg')));
  }
  if (route !== '/') html = html.replace(/<link\s+rel="preload"[^>]*>/g, '');
  const file = route === '/404' ? 'dist/404.html' : `dist${route === '/' ? '' : route}/index.html`;
  await mkdir(file.substring(0, file.lastIndexOf('/')), { recursive: true });
  await writeFile(file, html);
}
if (siteUrl) {
  const urls = routes.map((route) => `<url><loc>${escape(canonical(route === '/' ? '' : `${route}/`))}</loc></url>`).join('');
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${canonical('sitemap.xml')}\n`);
}
console.log(`Prerendered ${routes.length} routes and 404.html${siteUrl ? ', canonical URLs and sitemap' : ''}`);
