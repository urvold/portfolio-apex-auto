import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('APEX_TEST_URL','http://127.0.0.1:5173').rstrip('/')
Path('artifacts/v2').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/projects/');slider=page.get_by_role('slider');slider.scroll_into_view_if_needed();box=slider.bounding_box();cdp=context.new_cdp_session(page)
 slider.evaluate('''el=>{window.__pointerEvents=[];el.addEventListener('pointerdown',e=>{window.__pointerID=e.pointerId});for(const type of ['pointermove','pointercancel','lostpointercapture'])el.addEventListener(type,e=>window.__pointerEvents.push(type));}''')
 def touch(kind,x=0,y=0):
  points=[] if kind=='touchEnd' else [{'x':x,'y':y,'radiusX':3,'radiusY':3,'force':1,'id':1}]
  cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':points})
 x0=box['x']+box['width']*.16;y=box['y']+box['height']*.5
 touch('touchStart',x0,y);page.wait_for_timeout(20)
 assert slider.evaluate('(el)=>el.hasPointerCapture(window.__pointerID)'), 'touch did not capture pointer'
 samples=[]
 for i in range(1,13):
  x=box['x']+box['width']*(.16+i*.05);touch('touchMove',x,y);page.wait_for_timeout(16);samples.append(int(slider.get_attribute('aria-valuenow')))
 touch('touchEnd');assert len(set(samples))>=10,samples;assert samples==sorted(samples),samples;assert 74<=samples[-1]<=78,samples
 assert not slider.evaluate('(el)=>el.hasPointerCapture(window.__pointerID)')
 assert slider.locator('.compare-line').evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s'
 # A vertical gesture must scroll, cancel pointer handling, and leave the widget usable.
 slider.scroll_into_view_if_needed();box=slider.bounding_box();y=box['y']+box['height']*.6;x=box['x']+box['width']*.5;before=page.evaluate('scrollY')
 touch('touchStart',x,y)
 for i in range(1,9):touch('touchMove',x,y-i*15)
 touch('touchEnd');page.wait_for_timeout(100)
 assert abs(page.evaluate('scrollY')-before)>20,'vertical scroll was blocked'
 assert 'pointercancel' in page.evaluate('window.__pointerEvents')
 # Mouse capture continues outside component bounds and clamps at both ends.
 slider.scroll_into_view_if_needed();box=slider.bounding_box();y=box['y']+box['height']*.4
 page.mouse.move(box['x']+box['width']*.5,y);page.mouse.down();page.mouse.move(box['x']+box['width']+80,y,steps=8);assert slider.get_attribute('aria-valuenow')=='100'
 page.mouse.move(box['x']-80,y,steps=8);assert slider.get_attribute('aria-valuenow')=='0';page.mouse.up()
 slider.focus();slider.press('Home');slider.press('Shift+ArrowRight');assert slider.get_attribute('aria-valuenow')=='10';slider.press('PageUp');assert slider.get_attribute('aria-valuenow')=='20';slider.press('End');assert slider.get_attribute('aria-valuenow')=='100';slider.press('ArrowLeft');assert slider.get_attribute('aria-valuenow')=='99'
 # Anatomy is fully available using tabs, keyboard and large touch points.
 page.goto(BASE+'/');panel=page.get_by_role('tabpanel');headings=[]
 for tab in page.get_by_role('tab').all():
  tab.click();assert tab.get_attribute('aria-selected')=='true';headings.append(panel.locator('h3').inner_text());assert panel.get_by_role('link').get_attribute('href').startswith('/services/') or '/services/' in panel.get_by_role('link').get_attribute('href')
 assert len(set(headings))==6
 page.get_by_role('tab',name=re.compile('Колёса')).click();assert '+4 000 ₽' in panel.locator('.anatomy-context').inner_text().replace('\u00a0',' ') and 'К услуге ухода' in panel.locator('.anatomy-context').inner_text()
 page.get_by_role('tab').last.focus();page.keyboard.press('ArrowRight');assert page.get_by_role('tab').first.get_attribute('aria-selected')=='true'
 for point in page.locator('.anatomy-point').all():
  rect=point.bounding_box();assert rect['width']>=44 and rect['height']>=44;point.click();assert point.get_attribute('aria-pressed')=='true'
 page.get_by_role('button',name='Фотография',exact=True).click();assert page.locator('.anatomy-stage').evaluate('(el)=>el.classList.contains("photo-mode")')
 # Mobile menu returns focus on Escape and contains tab focus while open.
 page.evaluate('scrollTo(0,0)');page.get_by_role('button',name='Открыть меню').click();assert page.evaluate('document.body.style.overflow')=='hidden'
 page.get_by_role('button',name='Закрыть меню').focus();page.keyboard.press('Tab');assert page.get_by_role('navigation').get_by_role('link').first.evaluate('(el)=>el===document.activeElement')
 page.keyboard.press('Escape');assert page.get_by_role('button',name='Открыть меню').evaluate('(el)=>el===document.activeElement')
 # Archive has seven projects; filtered navigation stays within its selection.
 page.goto(BASE+'/projects/');assert page.locator('.project-card').count()==7
 page.get_by_role('button',name=re.compile(r'^Полировка(?:\s|$)')).click();assert page.locator('.project-card').count()==2;page.locator('.project-card').first.click();first=page.locator('dialog h3').inner_text();page.keyboard.press('ArrowRight');assert page.locator('dialog h3').inner_text()!=first;page.keyboard.press('ArrowRight');assert page.locator('dialog h3').inner_text()==first
 page.wait_for_timeout(350);page.screenshot(path='artifacts/v2/gallery-mobile.png');page.keyboard.press('Escape');assert page.locator('.project-card').first.evaluate('(el)=>el===document.activeElement')
 page.get_by_role('button',name=re.compile(r'^Все проекты(?:\s|$)')).click();page.locator('.project-card').first.click();first=page.locator('dialog h3').inner_text();box=page.locator('.lightbox-media').bounding_box();y=box['y']+box['height']*.5;x=box['x']+box['width']*.8
 touch('touchStart',x,y)
 for i in range(1,9):touch('touchMove',x-i*14,y)
 touch('touchEnd');assert page.locator('dialog h3').inner_text()!=first;page.keyboard.press('Escape')
 page.get_by_role('button',name=re.compile(r'^Интерьер(?:\s|$)')).click();page.locator('.project-card').click();assert page.get_by_role('button',name='Следующий проект').is_disabled();page.keyboard.press('Escape')
 # Reduced motion disables hero transforms and animation, without hiding the map.
 page.emulate_media(reduced_motion='reduce');page.goto(BASE+'/');page.evaluate('scrollTo(0,200)');page.wait_for_timeout(80)
 assert page.locator('.hero-image').evaluate('(el)=>getComputedStyle(el).transform')=='none';assert page.locator('main').evaluate('(el)=>getComputedStyle(el).animationName')=='none';assert page.get_by_role('tabpanel').is_visible()
 assert not errors,errors
 Path('artifacts/v2/interactions.json').write_text(json.dumps({'touchSamples':samples,'continuousTouch':True,'pointerCapture':True,'verticalScroll':True,'mouseClamp':True,'keyboard':True,'anatomyAreas':headings,'galleryProjects':7,'galleryTouchSwipe':True,'reducedMotion':True,'errors':errors},ensure_ascii=False,indent=2))
 browser.close()
print('PASS: continuous touch + pointer capture, vertical scrolling, mouse and keyboard, six anatomy areas, seven projects, filtered gallery/swipe/focus, menu and reduced motion.')
