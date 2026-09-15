import { test, expect } from "@playwright/test";
const base = "http://127.0.0.1:4325";
const sesion = { access_token: "test-access", refresh_token: "test-refresh" };
const widget = `window.Flow = () => ({
  elements: () => ({ create: () => ({ mount: (selector, token) => {
    const fields = document.createElement('div');
    fields.innerHTML = '<input placeholder="Nombre en la tarjeta" /><input placeholder="Número de tarjeta" /><input placeholder="MM / YY" /><input placeholder="CVV" />';
    fields.style.cssText = 'display:grid;gap:12px;padding:16px 0';
    Array.from(fields.children).forEach(input => input.style.cssText = 'border:1px solid #ccc;border-radius:6px;padding:12px;width:100%;box-sizing:border-box');
    document.querySelector(selector).appendChild(fields);
    const button = document.createElement('button'); button.textContent = 'Confirmar tarjeta de prueba';
    button.dataset.token = token; button.onclick = () => window.finishFlow();
    document.querySelector(selector).appendChild(button);
  } }) }),
  handleCardSubscribed: () => new Promise(resolve => { window.finishFlow = resolve; })
});`;
async function entorno(page, options = {}) {
  const calls = [], errors = [];
  let widgets = 0, checkouts = 0;
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.pathname.includes('/app/elements/')) {
      widgets++;
      return route.fulfill({ contentType: 'application/javascript', body: widget });
    }
    if (url.hostname === 'www.flow.cl') {
      // Simula el regreso que produce flow-webhook/retorno en el mismo origen.
      return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(base+'/flow/retorno?token='+url.searchParams.get('token'))})</script>` });
    }
    if (url.pathname.endsWith('/flow-suscripcion')) {
      const body = route.request().postDataJSON(); calls.push(body);
      if (body.accion === 'checkout') {
        checkouts++;
        return route.fulfill({ json: { token: 'registration-'+checkouts,
          url: 'https://www.flow.cl/app/customer/disclaimer.php?token=registration-'+checkouts,
          entorno: 'production', descuento_pct: body.codigo ? 50 : null,
        } });
      }
      return route.fulfill({ json: options.resultado ?? { ok: true, en_trial: true } });
    }
    if (url.pathname.endsWith('/auth/v1/signup')) return route.fulfill({ json: { ...sesion, user: { id: 'test-user' } } });
    return route.abort();
  });
  return { calls, errors, widgets: () => widgets };
}
async function abrirOnboarding(page) {
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await page.evaluate(s => {
    sessionStorage.setItem('pablo_plan_elegido', 'mensual');
    sessionStorage.setItem('pablo_sesion_tokens', JSON.stringify(s));
    window.pabloCuentaAsegurarSesion = async () => s;
    window.pabloGoTo('step-cuenta-pago');
  }, sesion);
  await expect(page.locator('#pago-medios')).toBeVisible();
}
for (const width of [390, 1440]) {
  test(`onboarding: tarjeta y Yape visibles a ${width}px, retorno conserva sesión`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const state = await entorno(page);
    await abrirOnboarding(page);
    await expect(page.getByPlaceholder("Número de tarjeta")).toBeVisible();
    await expect(page.locator('[data-flow-tarjeta]')).toHaveCount(0);
    const logo = page.locator('#pago-medios img');
    await expect(logo).toBeVisible();
    expect(await logo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const tarjeta = await page.locator('#pago-widget').boundingBox();
    const yape = await page.locator('#pago-medios').boundingBox();
    expect(yape.y).toBeGreaterThanOrEqual(tarjeta.y + tarjeta.height);
    expect(state.widgets()).toBe(1);
    await expect(page.locator('#pago-resumen')).toContainText('Vinculas tu medio de pago');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/pablo-landing-yape-${width}.png`, fullPage: true });
    await page.locator('#pago-medios [data-flow-yape]').click();
    await expect(page.getByRole('heading', { name: '¡Tu prueba gratis está activa!' })).toBeVisible();
    expect(state.calls.map(c => c.accion)).toEqual(['checkout', 'confirmar']);
    expect(state.calls[1].token).toBe('registration-1');
    await expect(page.locator('#flow-continuar')).toHaveAttribute('href', /\/auth\/sesion#access_token=test-access&refresh_token=test-refresh$/);
    expect(state.errors).toEqual([]);
  });
}
test('tarjeta sigue usando el widget y el mismo token', async ({ page }) => {
  const state = await entorno(page);
  await abrirOnboarding(page);

  const button = page.getByRole('button', { name: 'Confirmar tarjeta de prueba' });
  await expect(button).toHaveAttribute('data-token', 'registration-1');
  await button.click();
  await expect(page.locator('#pago-exito')).toBeVisible();
  expect(state.calls.map(c => c.accion)).toEqual(['checkout', 'confirmar']);
  expect(state.errors).toEqual([]);
});
test('aplicar cupón reemplaza el token que abre Yape', async ({ page }) => {
  const state = await entorno(page);
  await abrirOnboarding(page);
  await page.locator('#pago-cupon-toggle').click();
  await page.locator('#pago-cupon-input').fill('PROMO');
  await page.locator('#pago-cupon-form button').click();
  await expect(page.locator('#pago-cupon-ok')).toBeVisible();
  await page.locator('#pago-medios [data-flow-yape]').click();
  await expect(page.getByRole('heading', { name: '¡Tu prueba gratis está activa!' })).toBeVisible();
  expect(state.calls[1].codigo).toBe('PROMO');
  expect(state.calls[2]).toEqual({ accion: 'confirmar', token: 'registration-2' });
  expect(state.errors).toEqual([]);
});
test('modal de compra de la landing también permite Yape', async ({ page }) => {
  const state = await entorno(page);
  await page.goto('/planes');
  await page.evaluate(() => window.abrirCuentaPablo('mensual'));
  await page.locator('#cuenta-nombre').fill('Prueba');
  await page.locator('#cuenta-correo').fill('prueba@example.test');
  await page.locator('#cuenta-password').fill('test-password-123');
  await page.locator('#cuenta-enviar').click();
  await expect(page.locator('#cuenta-pago-medios')).toBeVisible();
  await expect(page.getByPlaceholder('Número de tarjeta')).toBeVisible();
  await expect(page.locator('#cuenta-pago-medios img')).toBeVisible();
  await page.locator('#cuenta-pago-medios [data-flow-yape]').click();
  await expect(page.getByRole('heading', { name: '¡Tu prueba gratis está activa!' })).toBeVisible();
  expect(state.calls.map(c => c.accion)).toEqual(['checkout', 'confirmar']);
  expect(state.errors).toEqual([]);
});
for (const [name, resultado, title] of [
  ['pendiente', { ok: true, pago_pendiente: true }, 'Medio de pago vinculado'],
  ['rechazado', { ok: false, error: 'Vinculación rechazada' }, 'No pudimos confirmar la vinculación'],
]) {
  test(`retorno ${name} no muestra pago exitoso`, async ({ page }) => {
    const state = await entorno(page, { resultado });
    await abrirOnboarding(page);
    await page.locator('#pago-medios [data-flow-yape]').click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.locator('#flow-detalle')).toContainText(name === 'pendiente' ? 'todavía' : 'rechazada');
    expect(state.calls.filter(c => c.accion === 'checkout')).toHaveLength(1);
  });
}

test("tarjeta pendiente tampoco muestra pago exitoso", async ({ page }) => {
  await entorno(page, { resultado: { ok: true, cobro_pendiente: true } });
  await abrirOnboarding(page);

  await page.getByRole("button", { name: "Confirmar tarjeta de prueba" }).click();
  await expect(page.locator("#pago-estado")).toContainText("todavía");
  await expect(page.locator("#pago-exito")).toBeHidden();
});

test("retorno sin sesión explica el problema y no crea un checkout", async ({ page }) => {
  const state = await entorno(page);
  await page.goto("/flow/retorno?token=registration-1");
  await expect(page.locator("#flow-detalle")).toContainText("sesión");
  await expect(page.locator("#flow-continuar")).toHaveAttribute("href", "https://usapablo.app/auth");
  expect(state.calls).toHaveLength(0);
});
