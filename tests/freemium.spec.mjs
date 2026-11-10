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
  test(`landing muestra descargas sin bloque Gratis a ${width}px`, async ({ page }) => {
    const state = await offline(page);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await expect(page.getByRole('link', { name: 'Descargar para iOS en App Store' })).toHaveAttribute('href', store);
    await expect(page.getByRole('img', { name: 'Google Play para Android: próximamente' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Empieza con lo esencial.' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Seguir con Gratis', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/pablo-audit-main-landing-${width}.png`, fullPage: false });
    expect(state.errors).toEqual([]);
  });
}
// Cuenta primero (PR #18, 10-nov-2026): la cuenta se crea en la pantalla 4,
// antes de las preguntas y los planes; «Seguir con Gratis» al final entra
// directo a la app con la sesión que ya existe.
test('la cuenta se crea después de la demo y sigue con las preguntas, no con el pago', async ({ page }) => {
  const state = await offline(page);
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await page.evaluate(() => window.pabloGoTo('step-4'));
  await expect(page.locator('[data-step="step-4"]')).toHaveClass(/active/);
  // pabloNext no hace nada mientras dura la transición de pantalla.
  await expect.poll(async () => {
    await page.evaluate(() => window.pabloNext());
    return page.locator('[data-step="step-cuenta-password"]').getAttribute('class');
  }).toMatch(/active/);
  await expect(page.locator('#cuenta-nombre')).toBeVisible();
  await page.locator('#cuenta-nombre').fill('Prueba Gratis');
  await page.locator('#cuenta-correo').fill('prueba@example.test');
  await page.locator('#cuenta-password').fill('test-pass-123');
  await page.evaluate(() => { window.pabloCuentaAsegurarSesion = async () => ({ access_token: 'test-access', refresh_token: 'test-refresh' }); });
  await page.locator('#cuenta-crear-btn').click();
  await expect(page.locator('[data-step="step-12"]')).toHaveClass(/active/);
  expect(page.url()).toContain('/onboarding');
  // Solo la medición del registro (CompleteRegistration por CAPI); nada de pagos.
  await expect.poll(() => state.calls).toEqual(['/functions/v1/meta-registro']);
  expect(state.errors).toEqual([]);
});
test('step-18b: Seguir con Gratis entra a la app con la cuenta ya creada', async ({ page }) => {
  const state = await offline(page);
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloSeguirGratis === 'function');
  await page.evaluate(() => {
    sessionStorage.setItem('pablo_plan_elegido', 'anual');
    sessionStorage.setItem('pablo_codigo_descuento', 'PREVIO');
    sessionStorage.setItem('pablo_sesion_tokens', JSON.stringify({ access_token: 'test-access', refresh_token: 'test-refresh' }));
    window.pabloGoTo('step-18b');
  });
  const next = page.waitForURL(/\/auth\/sesion\?plan=free/);
  await page.locator('[data-step="step-18b"]').getByRole('button', { name: 'Seguir con Gratis', exact: true }).click();
  await next;
  expect(page.url()).not.toContain('codigo=');
  expect(page.url()).toContain('access_token=test-access');
  expect(state.calls).toEqual([]);
  expect(state.errors).toEqual([]);
});
test('iPhone muestra aviso de App Store y respeta Seguir en la web', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' });
  const page = await context.newPage(); await offline(page);
  await page.goto('http://127.0.0.1:4325/');
  const dialog = page.getByRole('dialog', { name: 'Tu dinero, contigo.' });
  await expect(dialog).toBeVisible({ timeout: 18_000 });
  await expect(dialog.getByRole('link', { name: 'Descargar para iOS' })).toHaveAttribute('href', store);
  await page.screenshot({ path: '/tmp/pablo-audit-ios-prompt-landing.png' });
  await dialog.getByRole('button', { name: 'Seguir en la web' }).click();
  await page.reload(); await page.waitForTimeout(2200);
  await expect(dialog).toBeHidden();
  await context.close();
});
