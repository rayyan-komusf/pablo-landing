import { test, expect } from '@playwright/test';
const store = 'https://apps.apple.com/us/app/pablo-tu-compa%C3%B1ero-financiero/id6792320815';
async function offline(page) {
  const calls = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (['usapablo.app', 'localhost'].includes(url.hostname) && url.pathname === '/auth/sesion') return route.fulfill({ contentType: 'text/html', body: '<p>Puente de sesión de prueba</p>' });
    if (url.pathname.endsWith('/auth/v1/signup')) return route.fulfill({ json: { access_token: 'test-access', refresh_token: 'test-refresh', user: { id: 'test-user' } } });
    if (url.pathname.includes('/functions/')) calls.push(url.pathname);
    return route.abort();
  });
  return { calls, errors };
}
for (const width of [390, 1440]) {
  test(`landing explica Gratis y descargas a ${width}px`, async ({ page }) => {
    const state = await offline(page);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Descargar para iOS' })).toHaveAttribute('href', store);
    await expect(page.getByText('Android · Próximamente', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Seguir con Gratis', exact: true })).toHaveAttribute('href', '/onboarding?plan=free');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/pablo-audit-main-landing-${width}.png`, fullPage: true });
    expect(state.errors).toEqual([]);
  });
}
for (const step of ['step-18', 'step-18b']) {
  test(`${step}: elegir Gratis crea cuenta y omite el pago`, async ({ page }) => {
    const state = await offline(page);
    await page.goto('/onboarding');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.waitForFunction(() => typeof window.pabloSeguirGratis === 'function');
    await page.evaluate(step => {
      sessionStorage.setItem('pablo_plan_elegido', 'anual');
      sessionStorage.setItem('pablo_codigo_descuento', 'PREVIO');
      window.pabloGoTo(step);
    }, step);
    await page.locator(`[data-step="${step}"]`).getByRole('button', { name: 'Seguir con Gratis', exact: true }).click();
    await expect(page.locator('#cuenta-nombre')).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem('pablo_plan_elegido'))).toBe('free');
    expect(await page.evaluate(() => sessionStorage.getItem('pablo_codigo_descuento'))).toBe(null);
    await page.locator('#cuenta-nombre').fill('Prueba Gratis');
    await page.locator('[data-step="step-cuenta-nombre"]').getByRole('button', { name: /Continuar/ }).click();
    await page.locator('#cuenta-correo').fill('prueba@example.test');
    await page.locator('[data-step="step-cuenta-correo"]').getByRole('button', { name: /Continuar/ }).click();
    await page.locator('#cuenta-password').fill('test-pass-123');
    await page.evaluate(() => { window.pabloCuentaAsegurarSesion = async () => ({ access_token: 'test-access', refresh_token: 'test-refresh' }); });
    const next = page.waitForURL(/\/auth\/sesion\?plan=free/);
    await page.locator('#cuenta-crear-btn').click();
    await next;
    expect(state.calls).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}
test('iPhone muestra aviso de App Store y respeta Seguir en la web', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' });
  const page = await context.newPage(); await offline(page);
  await page.goto('http://127.0.0.1:4325/');
  const dialog = page.getByRole('dialog', { name: 'Tu dinero, contigo.' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Descargar para iOS' })).toHaveAttribute('href', store);
  await page.screenshot({ path: '/tmp/pablo-audit-ios-prompt-landing.png' });
  await dialog.getByRole('button', { name: 'Seguir en la web' }).click();
  await page.reload(); await page.waitForTimeout(2200);
  await expect(dialog).toBeHidden();
  await context.close();
});
