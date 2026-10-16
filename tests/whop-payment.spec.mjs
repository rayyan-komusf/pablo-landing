import { test, expect } from '@playwright/test';
async function setup(page, withSession = false) {
  const bad = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/flow\.cl|flow-suscripcion|moneda-sorteo/.test(request.url())) bad.push(request.url());
  });
  await page.addInitScript(withSession => {
    localStorage.setItem('pablo_intro_vista', '1');
    if (withSession) sessionStorage.setItem('pablo_sesion_tokens', JSON.stringify({access_token:'test-access',refresh_token:'test-refresh'}));
  }, withSession);
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (['usapablo.app', 'localhost'].includes(url.hostname)) return route.fulfill({contentType:'text/html',body:'<h1>App de prueba</h1>'});
    return route.abort();
  });
  return {bad, errors};
}
for (const [plan, id] of [['semanal','weekly'],['mensual','monthly'],['anual','annual']]) {
 test(`landing ${plan} opens app pricing without a Flow widget`, async ({page}) => {
  const state = await setup(page);
  await page.goto('/planes?utm_source=test');
  await page.waitForFunction(() => typeof window.abrirCuentaPablo === 'function');
  await expect(page.getByText(/3 días gratis|14 días gratis|prueba gratis/i)).toHaveCount(0);
  await page.locator(`#pricing-${id}-cta`).click();
  await expect(page).toHaveURL(new RegExp('https://usapablo.app/pricing\\?plan='+plan));
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('test');
  expect(state.bad).toEqual([]); expect(state.errors).toEqual([]);
 });
}
test('existing landing session is preserved for app checkout',async({page})=>{
 const state = await setup(page,true); await page.goto('/planes');
 await page.waitForFunction(()=>typeof window.abrirCuentaPablo==='function');
 await page.locator('#pricing-monthly-cta').click();
 await expect(page).toHaveURL(/usapablo.app\/auth\/sesion\?plan=mensual/);
 const url = new URL(page.url());expect(url.searchParams.get('access_token')).toBe(null);
 expect(new URLSearchParams(url.hash.slice(1)).get('access_token')).toBe('test-access');
 expect(state.bad).toEqual([]);
});
test('home has WHOP FAQ, no trial or coin promotion',async({page})=>{
 const state = await setup(page);await page.goto('/');
 await expect(page.getByText(/¿Tiramos una moneda/)).toHaveCount(0);
 const body = await page.locator('body').textContent();
 expect(body).not.toMatch(/procesa Flow|durante tu prueba gratis/);
 expect(body).toContain('WHOP');expect(state.bad).toEqual([]);
});
test('onboarding states exact immediate charge and hands payment to app',async({page})=>{
 const state=await setup(page,true);await page.goto('/onboarding');
 await page.waitForFunction(()=>typeof window.pabloGoTo==='function' && typeof window.pabloStartTrial==='function');
 await page.evaluate(()=>window.pabloGoTo('step-18b'));
 const step=page.locator('[data-step="step-18b"]');
 await expect(step.getByText('S/20 cada 30 días. El primer cobro se realiza al confirmar.',{exact:true})).toBeVisible();
 await expect(step.getByText(/3 días gratis|No pagas nada|Hoy pagas S\/.0/)).toHaveCount(0);
 await page.evaluate(()=>{sessionStorage.setItem('pablo_plan_elegido','mensual');window.pabloGoTo('step-cuenta-pago')});
 await page.getByRole('button',{name:'Continuar al pago',exact:true}).click();
 await expect(page).toHaveURL(/\/auth\/sesion\?plan=mensual/);
 expect(state.bad).toEqual([]);expect(state.errors).toEqual([]);
});

test('old landing return cannot confirm or retry a Flow payment', async ({page}) => {
 const state=await setup(page);await page.goto('/flow/retorno?token=historical');
 await expect(page.getByRole('heading',{name:'Revisa tu suscripción en Pablo'})).toBeVisible();
 await expect(page.getByRole('button',{name:/Reintentar/})).toHaveCount(0);
 expect(state.bad).toEqual([]);expect(state.errors).toEqual([]);
});

test('link de afiliado (?a=) viaja a la app en el checkout, los enlaces y el onboarding', async ({page}) => {
 const state = await setup(page);
 await page.goto('/planes?a=juan');
 await page.goto('/planes?a=maria.p_23');
 await page.goto('/planes?a=%3Cscript%3E');
 await page.waitForFunction(() => typeof window.abrirCuentaPablo === 'function' && typeof window.pabloConAfiliado === 'function');
 expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pablo_afiliado')).codigo)).toBe('maria.p_23');
 await page.locator('#pricing-monthly-cta').click();
 await expect(page).toHaveURL(/usapablo.app\/pricing\?plan=mensual/);
 expect(new URL(page.url()).searchParams.get('a')).toBe('maria.p_23');
 // Cualquier <a> a usapablo.app se decora al hacer clic.
 await page.goto('/planes');
 await page.waitForFunction(() => typeof window.pabloConAfiliado === 'function');
 await page.evaluate(() => { const a = document.createElement('a'); a.id = 'a-app'; a.href = 'https://usapablo.app/'; a.textContent = 'App'; document.body.prepend(a); });
 await page.locator('#a-app').click();
 await expect(page).toHaveURL(/usapablo.app\/\?a=maria.p_23/);
 // Onboarding: las salidas por JS pasan por pabloCuentaConPhDid.
 await page.goto('/onboarding');
 await page.waitForFunction(() => typeof window.pabloCuentaConPhDid === 'function' && typeof window.pabloConAfiliado === 'function');
 const salida = await page.evaluate(() => window.pabloCuentaConPhDid('https://usapablo.app/auth/sesion?plan=anual'));
 expect(new URL(salida).searchParams.get('a')).toBe('maria.p_23');
 expect(state.bad).toEqual([]); expect(state.errors).toEqual([]);
});
