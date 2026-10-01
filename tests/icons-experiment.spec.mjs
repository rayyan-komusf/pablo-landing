import { test, expect } from '@playwright/test';
async function isolate(page) {
 const forbidden = [], errors = [];
 page.on('request', r => { if (/flow\.cl|flow-suscripcion|moneda-sorteo/.test(r.url())) forbidden.push(r.url()); });
 page.on('pageerror', e => errors.push(e.message));
 await page.addInitScript(() => { if(location.hostname !== '127.0.0.1') return; localStorage.setItem('pablo_intro_vista','1'); sessionStorage.setItem('pablo_sesion_tokens',JSON.stringify({access_token:'test-access',refresh_token:'test-refresh'})); });
 await page.route('**/*', route => {
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1')return route.continue();
  if(['usapablo.app','localhost'].includes(url.hostname))return route.fulfill({contentType:'text/html',body:'App checkout test'});
  return route.abort();
 });
 return {forbidden,errors};
}
for(const variant of ['control','test']) {
 for(const width of [390,1440]) {
  test(`${variant} visuals at ${width}px: homepage and onboarding`,async({page})=>{
   const state=await isolate(page); await page.setViewportSize({width,height:844});
   await page.goto('/?icons-preview='+variant);
   await expect(page.locator('html')).toHaveAttribute('data-icons-variant',variant);
   await expect(page.locator('[data-icons-'+(variant==='test'?'control':'test')+']:visible')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.addStyleTag({content:'astro-dev-toolbar{display:none!important}'});
   await page.waitForTimeout(1000);
   await page.screenshot({path:`/tmp/pablo-icons-${variant}-home-${width}.png`,fullPage:true});
   await page.goto('/onboarding?icons-preview='+variant);
   await page.waitForFunction(()=>typeof window.pabloGoTo==='function');
   await page.evaluate(()=>window.pabloGoTo('step-11'));
   const step=page.locator('[data-step="step-11"]');
   await expect(step.locator('img[data-icons-'+variant+']').first()).toBeVisible();
   await expect(step.locator('img[data-icons-'+(variant==='test'?'control':'test')+']').first()).toBeHidden();
   await page.addStyleTag({content:'astro-dev-toolbar{display:none!important}'});
   await page.waitForTimeout(1000);
   await page.screenshot({path:`/tmp/pablo-icons-${variant}-onboarding-${width}.png`});
   await page.evaluate(()=>window.pabloGoTo('step-cuenta-nombre'));
   await page.locator('#cuenta-nombre').fill('Prueba');
   await expect(page.locator('#cuenta-nombre')).toHaveCount(1);
   await page.locator('[data-step="step-cuenta-nombre"]').getByRole('button',{name:/Continuar/}).click();
   await expect(page.locator('#cuenta-correo')).toBeVisible();
   expect(state.forbidden).toEqual([]);expect(state.errors).toEqual([]);
  });
 }
 for(const plan of ['semanal','mensual','anual']) {
  test(`${variant}: onboarding ${plan} continues to WHOP without Flow or trials`,async({page})=>{
   const state=await isolate(page); await page.goto('/onboarding?icons-preview='+variant);
   await page.waitForFunction(()=>typeof window.pabloGoTo==='function');
   await page.evaluate(()=>window.pabloGoTo('step-18b'));
   await expect(page.locator('[data-step="step-18b"]')).toContainText('WHOP');
   await expect(page.locator('[data-step="step-18b"]')).not.toContainText(/3 días gratis|prueba gratis|Hoy pagas S\/.0/);
   await page.waitForTimeout(1000);
   await page.screenshot({path:`/tmp/pablo-icons-${variant}-plans.png`});
   await page.evaluate(plan=>{sessionStorage.setItem('pablo_plan_elegido',plan);window.pabloGoTo('step-cuenta-pago')},plan);
   await page.getByRole('button',{name:'Continuar a WHOP',exact:true}).click();
   await expect(page).toHaveURL(new RegExp('/auth/sesion\\?plan='+plan));
   expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('access_token')).toBe('test-access');
   expect(state.forbidden).toEqual([]);expect(state.errors).toEqual([]);
  });
 }
}
test('real flag callback persists treatment from landing to onboarding and records only rendered exposure',async({page})=>{
 await isolate(page);
 await page.addInitScript(()=>{
  window.flagReads=[];window.flagCallback=null;
  window.posthog={onFeatureFlags:fn=>window.flagCallback=fn,getFeatureFlag:(key,options)=>{window.flagReads.push({key,options});return key==='landing-icons-v1'?'test':false},register:()=>{},capture:()=>{}};
 });
 await page.goto('/');
 await page.waitForFunction(()=>window.pabloIconExperiment && window.flagCallback);
 await page.evaluate(()=>window.flagCallback());
 await expect(page.locator('html')).toHaveAttribute('data-icons-variant','test');
 expect(await page.evaluate(()=>window.flagReads.filter(x=>x.key==='landing-icons-v1'&&!x.options).length)).toBe(1);
 await page.goto('/onboarding');
 await expect(page.locator('html')).toHaveAttribute('data-icons-variant','test');
});
