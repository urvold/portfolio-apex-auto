import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('APEX_TEST_URL','http://127.0.0.1:5173').rstrip('/')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE);page.wait_for_function('document.fonts.status === "loaded"')
 page.locator('img[loading=lazy]').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');page.wait_for_timeout(900);page.screenshot(path='artifacts/home-desktop.png',full_page=True)
 routes=['/','/services','/projects','/about','/contacts']+['/services/'+x for x in ['bodywork','painting','polishing','coatings','interior','film']]
 results=[]
 for route in routes:
  page.goto(BASE+route);page.wait_for_selector('h1')
  assert page.locator('h1').count()==1,route
  assert page.locator('img').evaluate_all('(imgs)=>imgs.every(i=>!i.complete || i.naturalWidth>0)'),route
  results.append({'route':route,'title':page.title()})
 # Layout widths on every route
 for width in [320,375,390,430,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':900})
  for route in routes:
   page.goto(BASE+route);page.wait_for_selector('h1')
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {width} {route}'
  results.append({'width':width,'routes':len(routes),'overflow':False})
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE);page.locator('img[loading=lazy]').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');page.wait_for_timeout(700);page.screenshot(path='artifacts/home-mobile.png',full_page=True)
 page.get_by_role('button',name='Открыть меню').click();page.get_by_role('navigation').get_by_role('link',name='Услуги',exact=True).click();assert page.url.endswith('/services')
 # calculator
 page.goto(BASE);calc=page.locator('.calc-panel');assert calc.locator('output').inner_text().replace('\u00a0',' ')== '18 000 ₽'
 calc.locator('select').nth(0).select_option('2');calc.locator('select').nth(1).select_option('1.25');calc.get_by_label('Детальная мойка').check();assert calc.locator('output').inner_text().replace('\u00a0',' ')== '23 000 ₽'
 # FAQ
 page.locator('summary').first.click();assert page.locator('details').first.get_attribute('open') is not None
 # compare keyboard
 slider=page.get_by_role('slider');slider.focus();slider.press('ArrowRight');assert slider.get_attribute('aria-valuenow')=='53'
 # gallery + lightbox + escape
 page.goto(BASE+'/projects');page.get_by_role('button',name=re.compile(r'^Интерьер(?:\s|$)')).click();assert page.locator('.project-card').count()==1
 page.get_by_role('button',name=re.compile(r'^Все проекты(?:\s|$)')).click();page.locator('.project-card').first.click();assert page.locator('dialog').is_visible();page.get_by_role('button',name='Следующий проект').click();page.keyboard.press('Escape');assert not page.locator('dialog').is_visible()
 page.screenshot(path='artifacts/projects-mobile.png',full_page=True)
 # form local-only
 page.goto(BASE+'/contacts');posts=[];page.on('request',lambda r:posts.append(r.url) if r.method!='GET' else None)
 page.locator('input[data-field="demo-name"]').fill('Тест');page.get_by_role('button',name='Показать демо-отправку').click();assert page.get_by_role('status').is_visible();assert page.locator('input[data-field="demo-name"]').input_value()=='';assert posts==[]
 assert page.evaluate('localStorage.length + sessionStorage.length')==0
 page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(700);page.screenshot(path='artifacts/contacts-mobile.png',full_page=True)
 assert errors==[],errors
 Path('artifacts/browser-results.json').write_text(json.dumps({'results':results,'interactions':'passed','pageErrors':errors,'formRequests':posts},ensure_ascii=False,indent=2))
 browser.close()
print('PASS: 11 routes × 7 widths, navigation, filter, lightbox, calculator, FAQ, comparison, local-only form; no page errors.')
