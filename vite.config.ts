import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.env.APEX_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
  throw new Error('APEX_BASE_PATH must be / or a slash-terminated path, e.g. /portfolio-apex-auto/');
}

export default defineConfig({
  base,
  plugins: [
    {
      name: 'apex-static-preview',
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url || '/', 'http://localhost');
          if (base !== '/' && url.pathname === base.slice(0, -1)) {
            res.statusCode = 302;
            res.setHeader('Location', base + url.search);
            res.end();
            return;
          }
          if (!url.pathname.startsWith(base)) return next();
          const path = '/' + url.pathname.slice(base.length);
          if (!path.includes('.') && existsSync(resolve('dist', '.' + path, 'index.html'))) {
            req.url = base + path.replace(/^\/|\/$/g, '') + '/index.html' + url.search;
            req.url = req.url.replace(/\/{2,}/g, '/');
          } else if (!path.includes('.') && req.headers.accept?.includes('text/html')) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(readFileSync(resolve('dist/404.html')));
            return;
          }
          next();
        });
      },
    },
  ],
});
