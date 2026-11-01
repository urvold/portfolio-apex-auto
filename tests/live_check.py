"""Read-only checks of the published GitHub Pages site; Chromium emulates mobile size."""
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

BASE = os.environ.get('APEX_LIVE_URL', 'https://urvold.github.io/portfolio-apex-auto').rstrip('/')
ROUTES = ['', 'services', 'projects', 'about', 'contacts'] + [
    'services/' + slug for slug in ['bodywork', 'painting', 'polishing', 'coatings', 'interior', 'film']
]

def check_http(route):
    url = BASE + '/' + route
    with urlopen(url, timeout=40) as response:
        html = response.read().decode()
        assert response.status == 200, url
        assert '<main' in html and '/assets/' in html and '/src/main.tsx' not in html, url
        assert len(re.findall(r'<h1[ >]', html)) == 1, url
        title = re.search(r'<title>(.*?)</title>', html, re.S).group(1)
        return {'path': route, 'status': response.status, 'url': response.url, 'title': title}

with ThreadPoolExecutor(max_workers=4) as pool:
    http_results = list(pool.map(check_http, ROUTES))
assert len({r['title'] for r in http_results}) == 11
try:
    urlopen(BASE + '/unknown/route', timeout=30)
    raise AssertionError('Unknown route must return 404')
except HTTPError as e:
    assert e.code == 404 and 'Здесь другой поворот' in e.read().decode()

with sync_playwright() as p:
    launch = {'executable_path': '/usr/bin/chromium', 'args': ['--no-sandbox']}
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
    if proxy:
        launch['proxy'] = {'server': proxy}
    browser = p.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    if os.environ.get('APEX_SYSTEM_TLS_TRANSPORT') == '1':
        # Chromium's NSS store may not include the cloud proxy CA. Fetch each live
        # response with urllib's system trust store; TLS and hostname checks stay enabled.
        cache = {}
        def verified_response(route):
            url = route.request.url
            is_asset = any(part in url for part in ['/assets/', '/images/', '/fonts/'])
            if is_asset and url in cache:
                status, headers, body = cache[url]
            else:
                try:
                    response = urlopen(url, timeout=40)
                except HTTPError as e:
                    response = e
                with response:
                    status = response.status
                    body = response.read()
                    headers = {k: v for k, v in response.headers.items() if k.lower() not in {
                        'content-length', 'content-encoding', 'transfer-encoding', 'connection'
                    }}
                if is_asset:
                    cache[url] = (status, headers, body)
            route.fulfill(status=status, headers=headers, body=body)
        context.route('https://urvold.github.io/**', verified_response)
    page = context.new_page()
    errors, failed = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('requestfailed', lambda r: failed.append(r.url))
    for route in ROUTES:
        response = page.goto(BASE + '/' + route + ('/' if route else ''))
        assert response.status == 200
        response = page.reload()
        assert response.status == 200
        page.wait_for_selector('h1')
        page.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")')
        page.wait_for_function('Array.from(document.images).every(i=>i.complete)')
        assert page.locator('img').evaluate_all('(imgs)=>imgs.every(i=>i.naturalWidth>0)'), route
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), route
    page.goto(BASE + '/')
    page.get_by_role('button', name='Открыть меню').click()
    page.get_by_role('navigation').get_by_role('link', name='Услуги', exact=True).click()
    page.get_by_role('link', name='Кузовной ремонт', exact=False).first.click()
    page.reload()
    assert page.locator('h1').inner_text() == 'Кузовной ремонт'
    page.goto(BASE + '/')
    calc = page.locator('.calc-panel')
    calc.locator('select').nth(0).select_option('2')
    calc.locator('select').nth(1).select_option('1.25')
    calc.get_by_label('Детальная мойка').check()
    assert calc.locator('output').inner_text().replace('\u00a0', ' ') == '23 000 ₽'
    slider = page.get_by_role('slider')
    slider.focus()
    slider.press('ArrowRight')
    assert slider.input_value() == '53'
    page.locator('summary').first.click()
    assert page.locator('details').first.get_attribute('open') is not None
    page.goto(BASE + '/projects/')
    page.get_by_role('button', name='Интерьер', exact=True).click()
    assert page.locator('.project-card').count() == 1
    page.locator('.project-card').click()
    assert page.locator('dialog').is_visible()
    page.keyboard.press('Escape')
    assert not page.locator('dialog').is_visible()
    page.goto(BASE + '/contacts/')
    posts = []
    page.on('request', lambda r: posts.append(r.url) if r.method != 'GET' else None)
    page.locator('input[data-field="demo-name"]').fill('Демо')
    page.get_by_role('button', name='Показать демо-отправку').click()
    assert page.get_by_role('status').is_visible()
    assert not page.locator('input[data-field="demo-name"]').input_value()
    assert posts == []
    assert page.evaluate('localStorage.length + sessionStorage.length') == 0
    assert errors == [], errors
    assert failed == [], failed
    page.goto(BASE + '/')
    page.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")')
    page.wait_for_function('Array.from(document.images).every(i=>i.complete)')
    page.wait_for_timeout(800)
    page.screenshot(path='artifacts/live-mobile.png', full_page=True)
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.wait_for_timeout(400)
    page.screenshot(path='artifacts/live-desktop.png', full_page=True)
    browser.close()
Path('artifacts/live-check.json').write_text(json.dumps({
    'base': BASE, 'http': http_results, 'reloads': 11, 'mobileWidth': 390,
    'interactions': 'passed', 'systemTLSTransport': os.environ.get('APEX_SYSTEM_TLS_TRANSPORT') == '1', 'errors': errors, 'failedRequests': failed, 'formRequests': posts,
}, ensure_ascii=False, indent=2))
print('PASS: published HTTPS site, 11 direct routes + reloads, images, mobile navigation, calculator, gallery, comparison, FAQ, local-only form; zero console errors or failed resources.')
