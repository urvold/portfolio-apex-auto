"""Serve dist exactly as a project subdirectory, with directory-index redirects."""
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

BASE = os.environ.get('APEX_BASE_PATH', '/portfolio-apex-auto/')
ROOT = Path('dist').resolve()
ROUTES = ['', 'services', 'projects', 'about', 'contacts'] + [
    'services/' + slug for slug in ['bodywork', 'painting', 'polishing', 'coatings', 'interior', 'film']
]

class PagesHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def translate_path(self, path):
        clean = urlsplit(path).path
        if clean == BASE.rstrip('/'):
            clean += '/'
        if not clean.startswith(BASE):
            return str(ROOT / '__not_found__')
        return super().translate_path('/' + clean[len(BASE):])

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write((ROOT / '404.html').read_bytes())
        else:
            super().send_error(code, message, explain)

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(PagesHandler, directory=str(ROOT)))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f'http://127.0.0.1:{server.server_port}'
results = []
errors = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        for route in ROUTES:
            for suffix in ([''] if not route else ['', '/']):
                url = origin + BASE + route + suffix
                response = page.goto(url)
                assert response.status == 200, url
                response = page.reload()
                assert response.status == 200, url
                page.wait_for_selector('h1')
                page.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")')
                page.wait_for_function('Array.from(document.images).every(i=>i.complete)')
                assert page.locator('img').evaluate_all('(imgs)=>imgs.every(i=>i.naturalWidth>0)'), url
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), url
                assert page.locator('link[rel="canonical"]').count() == 1, url
                assert page.locator('a[href^="/services"]').count() == 0, url
                results.append({'path': route + suffix, 'reload': 200})
        page.goto(origin + BASE)
        page.get_by_role('button', name='Открыть меню').click()
        page.get_by_role('navigation').get_by_role('link', name='Услуги', exact=True).click()
        page.get_by_role('link', name='Кузовной ремонт', exact=False).first.click()
        assert page.url.endswith('/services/bodywork'), page.url
        page.reload()
        assert page.locator('h1').inner_text() == 'Кузовной ремонт'
        assert not errors, errors
        response = page.goto(origin + BASE + 'unknown/route')
        assert response.status == 404
        assert 'Здесь другой поворот' in page.locator('h1').inner_text()
        assert not errors, errors
        page.goto(origin + BASE + 'contacts/')
        requests = []
        page.on('request', lambda r: requests.append(r.url) if r.method != 'GET' else None)
        page.locator('input[data-field="demo-name"]').fill('Демо')
        page.get_by_role('button', name='Показать демо-отправку').click()
        assert page.get_by_role('status').is_visible()
        assert requests == []
        assert page.evaluate('localStorage.length + sessionStorage.length') == 0
        browser.close()
    Path('artifacts').mkdir(exist_ok=True)
    Path('artifacts/pages-smoke.json').write_text(json.dumps({'base': BASE, 'checks': results, 'errors': errors, 'formRequests': requests}, ensure_ascii=False, indent=2))
    print(f'PASS: {len(results)} direct URL variants + reload, mobile navigation, fonts/images, 404 and local-only form under {BASE}')
finally:
    server.shutdown()
    server.server_close()
