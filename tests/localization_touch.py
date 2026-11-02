"""UI language audit and local-only pointer regression checks.
Chromium: native CDP touch streams. WebKit: native tap/mouse, scripted moves during native touch.
"""
import json, math, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('APEX_TEST_URL','http://127.0.0.1:4180/portfolio-apex-auto').rstrip('/')
ENGINE=os.environ.get('APEX_ENGINE','chromium')
OUT=Path('artifacts/ru-touch');OUT.mkdir(parents=True,exist_ok=True)
ROUTES=['/','/services','/projects','/about','/contacts']+['/services/'+s for s in ['bodywork','painting','polishing','coatings','interior','film']]
WIDTHS=[320,375,390,430,768,1024,1440]

def foreign(text):
 text=re.sub(r'\b(?:APEX\s*AUTO|APEX|AUTO|A)\b','',text)
 return re.findall(r'[A-Za-z]+',text)

def check_language(page,label):
 visible=page.locator('body').evaluate('''root=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const result=[];while(walker.nextNode()){const node=walker.currentNode;const parent=node.parentElement;if(parent&&parent.getClientRects().length&&!['SCRIPT','STYLE'].includes(parent.tagName)&&getComputedStyle(parent).visibility!=='hidden')result.push(node.textContent)}return result.join('\\n')}''')
 assert not foreign(visible),(label,foreign(visible))
 strings=page.locator('[alt],[aria-label],[placeholder],[title]').evaluate_all('(els)=>els.flatMap(el=>["alt","aria-label","placeholder","title"].map(a=>el.getAttribute(a)||""))')
 for text in strings:assert not foreign(text),(label,text)
 contents=page.locator('body *').evaluate_all('''els=>els.filter(el=>el.getClientRects().length).flatMap(el=>['::before','::after'].map(p=>getComputedStyle(el,p).content)).filter(x=>x&&x!=='none'&&x!=='normal')''')
 for content in contents:
  content=re.sub(r'\\[0-9a-fA-F]{1,6}\s?', ' ', content)
  assert not foreign(content),(label,content)

with sync_playwright() as p:
 if ENGINE=='webkit':
  directory=Path(os.environ.get('APEX_WEBKIT_DIR','/tmp/apex-playwright/webkit-2336/minibrowser-wpe'))
  env=dict(os.environ);env.update({'LD_LIBRARY_PATH':f'{directory}/lib:{directory}/sys/lib:/tmp/apex-webkit-libs/usr/lib/x86_64-linux-gnu','WEBKIT_EXEC_PATH':str(directory/'bin'),'WEBKIT_INJECTED_BUNDLE_PATH':str(directory/'lib'),'WEBKIT_INSPECTOR_RESOURCES_PATH':str(directory/'share')})
  browser=p.webkit.launch(executable_path=str(directory/'bin/MiniBrowser'),env=env)
 else:browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 for width in WIDTHS:
  page.set_viewport_size({'width':width,'height':844 if width<768 else 1000})
  for route in ROUTES:
   page.goto(BASE+route);page.wait_for_function('document.fonts.status==="loaded"');check_language(page,(ENGINE,width,route))
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
   clipped=page.locator('h1,h2,h3,p,label,summary,.brand-rail>span,.anatomy-toolbar>span').evaluate_all('(els)=>els.filter(el=>el.clientWidth>5&&el.scrollWidth>el.clientWidth+2&&!el.classList.contains("sr-only")).map(el=>el.innerText)')
   assert not clipped,(width,route,clipped)
  if width in [320,390,1440]:
   page.goto(BASE+'/');page.wait_for_function('document.fonts.status==="loaded"');page.wait_for_timeout(700);page.screenshot(path=str(OUT/f'{ENGINE}-home-{width}.png'),full_page=True)
 # Dynamic states, including every caption in the fullscreen gallery.
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/')
 for tab in page.get_by_role('tab').all():tab.click();check_language(page,'anatomy')
 page.evaluate('scrollTo(0,0)');page.get_by_role('button',name='Открыть меню').click();check_language(page,'menu');page.keyboard.press('Escape')
 page.goto(BASE+'/projects/');page.locator('.project-card').first.click()
 for i in range(7):check_language(page,'dialog');page.get_by_role('button',name='Следующий проект').click()
 page.wait_for_timeout(350);page.screenshot(path=str(OUT/f'{ENGINE}-dialog.png'));page.keyboard.press('Escape')
 touch_results=[]
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844});page.goto(BASE+'/projects/');page.wait_for_function('document.fonts.status==="loaded"')
  slider=page.get_by_role('slider');slider.scroll_into_view_if_needed();page.wait_for_timeout(120)
  box=slider.bounding_box();assert slider.evaluate('(el)=>getComputedStyle(el).touchAction')=='none'
  assert slider.locator('.before-image').evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s'
  assert slider.locator('.compare-line').evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s'
  assert slider.locator('img').evaluate_all('(els)=>els.every(el=>el.draggable===false)')
  slider.evaluate('''el=>{window.__events=[];document.addEventListener('pointerdown',e=>{if(e.target===el){window.__pointerId=e.pointerId;window.__touchType=e.pointerType;window.__capturedAtDown=el.hasPointerCapture(e.pointerId);}});for(const type of ['pointercancel','lostpointercapture'])el.addEventListener(type,e=>window.__events.push(type));}''')
  images_before=slider.locator('img').evaluate_all('(els)=>els.map(el=>{const b=el.getBoundingClientRect();return [b.x,b.y,b.width,b.height]})')
  scroll=page.evaluate('scrollY');body_overflow=page.evaluate('document.body.style.overflow');values=[]
  if ENGINE=='chromium':
   cdp=context.new_cdp_session(page)
   def touch(kind,x=0,y=0):cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if kind in ['touchEnd','touchCancel'] else [{'x':x,'y':y,'radiusX':3,'radiusY':3,'force':1,'id':1}]})
   y=box['y']+box['height']*.5;touch('touchStart',box['x']+box['width']*.15,y);page.wait_for_timeout(25)
   assert page.evaluate('window.__capturedAtDown')
   fractions=[.20,.25,.30,.35,.40,.45,.50,.55,.60,.65,.70,.75,.80,.75,.70,.65,.60,.55,.50,.45,.40,.35,.30,.25]
   for i,fraction in enumerate(fractions):
    touch('touchMove',box['x']+box['width']*fraction,y+(i%5-2)*9);page.wait_for_timeout(18);actual=int(slider.get_attribute('aria-valuenow'));values.append(actual)
    assert abs(actual-round(fraction*100))<=1,(actual,fraction)
    assert abs(page.evaluate('scrollY')-scroll)<=1,'diagonal drag scrolled document'
    assert slider.evaluate('(el)=>el.hasPointerCapture(window.__pointerId)')
   assert 'pointercancel' not in page.evaluate('window.__events')
   touch('touchEnd');assert not slider.evaluate('(el)=>el.hasPointerCapture(window.__pointerId)')
   touch('touchStart',box['x']+box['width']*.65,y);touch('touchCancel');page.wait_for_timeout(30);assert not slider.evaluate('(el)=>el.hasPointerCapture(window.__pointerId)')
   # A fresh gesture after cancel remains functional.
   touch('touchStart',box['x']+box['width']*.4,y);touch('touchMove',box['x']+box['width']*.6,y+20);touch('touchEnd');assert abs(int(slider.get_attribute('aria-valuenow'))-60)<=1
  else:
   # A real WebKit touchscreen tap acquires and releases native capture.
   page.touchscreen.tap(box['x']+box['width']*.3,box['y']+box['height']*.5);assert abs(int(slider.get_attribute('aria-valuenow'))-30)<=1
   assert page.evaluate('window.__touchType')=='touch';assert page.evaluate('window.__capturedAtDown')
   # WebKit's public input API has no continuous touch stream; moves here are scripted
   # during an active native touch. Native diagonal streams are checked above in Chromium.
   slider.evaluate('''el=>{window.__scriptMoves=true;document.addEventListener('pointerdown',e=>{if(e.target!==el||e.pointerType!=='touch'||!window.__scriptMoves)return;const b=el.getBoundingClientRect();for(const fraction of [.2,.4,.7,.5,.8])el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:e.pointerId,pointerType:'touch',isPrimary:true,buttons:1,clientX:b.left+b.width*fraction,clientY:b.top+b.height*.5+12}));},{once:true});}''')
   page.touchscreen.tap(box['x']+box['width']*.2,box['y']+box['height']*.5);page.wait_for_timeout(80);assert abs(int(slider.get_attribute('aria-valuenow'))-80)<=1
   values=[int(slider.get_attribute('aria-valuenow'))]
  assert abs(page.evaluate('scrollY')-scroll)<=1
  assert page.evaluate('document.body.style.overflow')==body_overflow!='hidden'
  assert slider.locator('img').evaluate_all('(els)=>els.map(el=>{const b=el.getBoundingClientRect();return [b.x,b.y,b.width,b.height]})')==images_before,'images moved'
  # Native mouse capture with diagonal movement outside the widget.
  y=box['y']+box['height']*.4;page.mouse.move(box['x']+box['width']*.5,y);page.mouse.down();page.mouse.move(box['x']-30,y+20,steps=7);assert slider.get_attribute('aria-valuenow')=='0';page.mouse.move(box['x']+box['width']+30,y-20,steps=7);assert slider.get_attribute('aria-valuenow')=='100';page.mouse.up()
  slider.focus();slider.press('Home');slider.press('Shift+ArrowRight');assert slider.get_attribute('aria-valuenow')=='10';slider.press('End');assert slider.get_attribute('aria-valuenow')=='100'
  # Scrolling outside continues after the interaction; there is no global body lock.
  if ENGINE=='chromium':
   touch('touchStart',width*.5,170)
   for i in range(1,9):touch('touchMove',width*.5,170-i*13)
   touch('touchEnd');page.wait_for_timeout(120);assert abs(page.evaluate('scrollY')-scroll)>20
  else:
   # Mobile WebKit has no wheel injection; use native keyboard scrolling outside.
   slider.evaluate('(el)=>el.blur()');page.keyboard.press('PageDown');page.wait_for_timeout(350);assert abs(page.evaluate('scrollY')-scroll)>20
  touch_results.append({'width':width,'values':values,'noScrollDuringDrag':True,'capture':True,'outsideScroll':True,'imagesStationary':True})
 assert not errors,errors
 (OUT/f'{ENGINE}-results.json').write_text(json.dumps({'engine':ENGINE,'routes':len(ROUTES),'widths':WIDTHS,'latinUI':[],'diagonalTouch': 'native CDP' if ENGINE=='chromium' else 'native tap plus scripted pointer moves; native mouse diagonal','slider':touch_results,'errors':errors,'realIPhone':False},ensure_ascii=False,indent=2))
 browser.close()
print(f'PASS {ENGINE}: localization at 11 x 7 sizes + dynamic states, no clipping/overflow, capture/diagonal handling, stable images, keyboard and outside scrolling.')
