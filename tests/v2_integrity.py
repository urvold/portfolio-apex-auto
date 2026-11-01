import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('APEX_TEST_URL','http://127.0.0.1:4180/portfolio-apex-auto').rstrip('/')
routes=['/','/services','/projects','/about','/contacts']+['/services/'+s for s in ['bodywork','painting','polishing','coatings','interior','film']]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page();errors=[];failed=[];external=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 page.on('requestfailed',lambda r:failed.append(r.url))
 page.on('request',lambda r:external.append(r.url) if not r.url.startswith(BASE) else None)
 for route in routes:
  response=page.goto(BASE+route);assert response.status==200
  page.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');page.wait_for_function('Array.from(document.images).every(i=>i.complete)')
  assert page.locator('img').evaluate_all('(imgs)=>imgs.every(i=>i.naturalWidth>0)'),route
 assert not errors,errors;assert not failed,failed;assert not external,external
 page.goto(BASE+'/contacts/');posts=[];page.on('request',lambda r:posts.append(r.url) if r.method!='GET' else None)
 page.locator('input[data-field="demo-name"]').fill('Демо');page.locator('input[data-field="demo-name"]').press('Enter');assert page.get_by_role('status').is_visible();assert not page.locator('input[data-field="demo-name"]').input_value();assert posts==[]
 assert page.evaluate('localStorage.length+sessionStorage.length')==0
 plain=browser.new_context(java_script_enabled=False).new_page();plain.goto(BASE+'/contacts/');assert plain.locator('form [name]').count()==0;assert plain.locator('form button').get_attribute('type')=='button'
 response=page.request.get(BASE+'/unknown/route',headers={'Accept':'text/html'});assert response.status==404;assert 'Здесь другой поворот' in response.text()
 Path('artifacts/v2/integrity.json').write_text(json.dumps({'routes':len(routes),'consoleErrors':errors,'failedRequests':failed,'externalRuntimeRequests':external,'formNonGETRequests':posts,'keyboardForm':True,'noJavaScriptSafety':True,'unknownRoute':404},ensure_ascii=False,indent=2));browser.close()
print('PASS: 11 routes, all photos, zero console errors/failed resources/external requests, keyboard demo form, no-JS form safety and HTTP 404.')
