import json, os
from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
BASE=os.environ.get('APEX_TEST_URL','http://127.0.0.1:5173').rstrip('/')
OUT=Path('artifacts/v2');OUT.mkdir(exist_ok=True,parents=True)
routes=['/','/services','/projects','/about','/contacts']+['/services/'+s for s in ['bodywork','painting','polishing','coatings','interior','film']]
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for w in [320,375,390,430,768,1024,1440]:
  page.set_viewport_size({'width':w,'height':844 if w<600 else 1000});page.goto(BASE+'/');page.wait_for_function('document.fonts.status==="loaded"');page.wait_for_timeout(750)
  actions=page.locator('.hero-actions').bounding_box();caption=page.locator('.hero-caption').bounding_box();assert actions['y']+actions['height'] <= caption['y']-6,('hero overlap',w,actions,caption)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),w
  if w<600:
   for el in page.locator('.intro-copy p,.anatomy-panel p,.process-grid p,.calculator .muted,.demo-note p').all():assert el.evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)')>=16
  results.append({'width':w,'heroOverlap':False})
 page.set_viewport_size({'width':320,'height':844})
 for route in routes:
  page.goto(BASE+route);page.wait_for_function('document.fonts.status==="loaded"')
  clipped=page.locator('h1,h2,h3,p,label,summary').evaluate_all('(els)=>els.filter(el=>el.clientWidth>5&&el.scrollWidth>el.clientWidth+2&&!el.classList.contains("sr-only")).map(el=>({tag:el.tagName,text:el.innerText.slice(0,100)}))')
  assert not clipped,(route,clipped)
  results.append({'route':route,'width':320,'clippedText':False})
 for w in [390,1440]:
  page.set_viewport_size({'width':w,'height':844 if w==390 else 1000})
  for route in routes:
   page.goto(BASE+route);page.wait_for_function('document.fonts.status==="loaded"');page.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');page.wait_for_function('Array.from(document.images).every(i=>i.complete)');page.wait_for_timeout(700)
   assert page.locator('img').evaluate_all('(imgs)=>imgs.every(i=>i.naturalWidth>0)'),(route,w)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,w)
   name=route.strip('/').replace('/','-') or 'home';page.screenshot(path=str(OUT/f'final-{name}-{w}.png'),full_page=True)
   results.append({'route':route,'width':w,'screenshot':True})
 assert not errors,errors;b.close()
for w in [390,1440]:
 sheet=Image.new('RGB',(1200,960),'#15171b');draw=ImageDraw.Draw(sheet)
 for i,route in enumerate(routes):
  name=route.strip('/').replace('/','-') or 'home';im=Image.open(OUT/f'final-{name}-{w}.png');im=im.crop((0,0,w,min(im.height,800 if w==390 else 1000)));im.thumbnail((282,275));x=(i%4)*300;y=(i//4)*320;sheet.paste(im,(x,y));draw.text((x,y+280),route,fill='#f2f0eb')
 sheet.save(OUT/f'audit-sheet-{w}.jpg')
(OUT/'visual-audit.json').write_text(json.dumps({'results':results,'errors':errors},ensure_ascii=False,indent=2))
print('PASS: hero spacing at 7 widths, mobile body type >=16px, 22 complete page screenshots, all photos load; no overflow or JavaScript errors.')
