import { test, expect } from '@playwright/test';

// Experimento A/B de Gratis en el onboarding (Sandra 9-nov-2026): flag de
// PostHog `onboarding-gratis` con variantes control y sin_gratis. sin_gratis
// esconde Gratis como al afiliado; la pauta (y el afiliado) quedan fuera del
// experimento. El registro manda la variante en atribucion.ab.
//
// PostHog no carga en las pruebas (sin red): se reemplaza por uno de mentira
// que asigna la variante pedida y anota qué flags se leyeron.
async function conPosthog(page, variante) {
  await page.addInitScript(v => {
    window.__flagsLeidas = [];
    const base = {
      __SV: 1,
      onFeatureFlags(cb) { setTimeout(cb, 0); },
      getFeatureFlag(flag) {
        window.__flagsLeidas.push(flag);
        return flag === 'onboarding-gratis' ? v : undefined;
      },
    };
    window.posthog = new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => {}) });
  }, variante);
}

async function sinRed(page) {
  const signups = [];
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (['usapablo.app', 'localhost'].includes(url.hostname) && url.pathname === '/auth/sesion') {
      return route.fulfill({ contentType: 'text/html', body: '<p>Puente de sesión de prueba</p>' });
    }
    if (url.pathname.endsWith('/auth/v1/signup')) {
      signups.push(route.request().postDataJSON());
      return route.fulfill({ json: { access_token: 'test-access', refresh_token: 'test-refresh', user: { id: 'test-user' } } });
    }
    return route.abort();
  });
  return { signups, errores };
}

const claseSinGratis = page =>
  page.evaluate(() => document.documentElement.classList.contains('ab-onboarding-gratis-sin_gratis'));

test('sin_gratis: la landing esconde Gratis como al afiliado', async ({ page }) => {
  const { errores } = await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/');
  await expect.poll(() => claseSinGratis(page)).toBe(true);
  await expect(page.locator('#hero-cta-btn .con-gratis')).toBeHidden();
  await expect(page.locator('#hero-cta-btn .sin-gratis')).toBeVisible();
  expect(await page.locator('.faq-item.con-gratis').count()).toBeGreaterThan(0);
  await expect(page.locator('.faq-item.con-gratis').first()).toBeHidden();
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeHidden();
  expect(await page.evaluate(() => window.__flagsLeidas)).toContain('onboarding-gratis');
  expect(errores).toEqual([]);
});

test('control: Gratis se ve como siempre', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'control');
  await page.goto('/planes');
  await expect.poll(() => page.evaluate(() => window.__flagsLeidas.includes('onboarding-gratis'))).toBe(true);
  expect(await claseSinGratis(page)).toBe(false);
  await expect(page.locator('.free-plan')).toBeVisible();
});

test('pauta: fuera del experimento, sigue con Gratis y no se lee la flag', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/?utm_source=facebook&utm_medium=paid&utm_campaign=prueba&utm_content=prueba');
  await page.waitForFunction(() => typeof window.pabloAB?.abDelRegistro === 'function');
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__flagsLeidas)).not.toContain('onboarding-gratis');
  expect(await claseSinGratis(page)).toBe(false);
  await expect(page.locator('#hero-cta-btn .con-gratis')).toBeVisible();
  expect(await page.evaluate(() => window.pabloAB.abDelRegistro())).toBeNull();
});

test('quien entró sin Gratis y después llega por pauta vuelve a ver Gratis', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/');
  await expect.poll(() => claseSinGratis(page)).toBe(true);
  await page.goto('/?utm_source=facebook&utm_medium=paid&utm_campaign=prueba');
  expect(await claseSinGratis(page)).toBe(false);
  await expect(page.locator('#hero-cta-btn .con-gratis')).toBeVisible();
});

test('?ab= fuerza la variante en la pestaña para probar', async ({ page }) => {
  await sinRed(page);
  await page.goto('/planes?ab=onboarding-gratis:sin_gratis');
  await expect(page.locator('.free-plan')).toBeHidden();
  expect(await page.evaluate(() => window.pabloAB.abDelRegistro())).toBe('onboarding-gratis:sin_gratis');
});

async function registrarse(page) {
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function' && typeof window.pabloAB?.abDelRegistro === 'function');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    sessionStorage.setItem('pablo_plan_elegido', 'mensual');
    window.pabloGoTo('step-cuenta-password');
  });
  await page.locator('#cuenta-nombre').fill('Prueba AB');
  await page.locator('#cuenta-correo').fill('prueba-ab@example.test');
  await page.locator('#cuenta-password').fill('test-pass-123');
  await page.evaluate(() => { window.pabloCuentaAsegurarSesion = async () => ({ access_token: 'test-access', refresh_token: 'test-refresh' }); });
  await page.locator('#cuenta-crear-btn').click();
}

for (const variante of ['sin_gratis', 'control']) {
  test(`el registro guarda la variante ${variante} en atribucion.ab`, async ({ page }) => {
    const red = await sinRed(page);
    await conPosthog(page, variante);
    await registrarse(page);
    await expect.poll(() => red.signups.length).toBe(1);
    expect(red.signups[0].data.atribucion.ab).toBe(`onboarding-gratis:${variante}`);
    expect(red.signups[0].data.registro_origen).toBe('onboarding');
    expect(red.errores).toEqual([]);
  });
}

test('sin_gratis: el onboarding no ofrece «Seguir con Gratis»', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await expect.poll(() => claseSinGratis(page)).toBe(true);
  for (const step of ['step-18', 'step-18b', 'step-cuenta-pago']) {
    await page.evaluate(s => window.pabloGoTo(s), step);
    const boton = page.locator(`[data-step="${step}"] button.con-gratis, [data-step="${step}"] .con-gratis button`).filter({ hasText: 'Seguir con Gratis' });
    expect(await boton.count()).toBeGreaterThan(0);
    await expect(boton.first()).toBeHidden();
  }
});

// Salida discreta (Sandra 11-nov-2026): en sin_gratis quien no paga entra a la
// app con la cuenta que ya creó, sin que se le ofrezca Gratis.
const ENLACE = 'Ahora no, entrar a mi cuenta';
const enlace = (page, step) => page.locator(`[data-step="${step}"] button`, { hasText: ENLACE });

test('sin_gratis: «Ahora no, entrar a mi cuenta» lleva a la app con la cuenta creada', async ({ page }) => {
  const { errores } = await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloEntrarSinPagar === 'function');
  await expect.poll(() => claseSinGratis(page)).toBe(true);
  await page.evaluate(() => window.pabloGoTo('step-cuenta-pago'));
  await expect(enlace(page, 'step-cuenta-pago')).toBeVisible();
  await page.evaluate(() => {
    sessionStorage.setItem('pablo_plan_elegido', 'anual');
    sessionStorage.setItem('pablo_codigo_descuento', 'PREVIO');
    sessionStorage.setItem('pablo_sesion_tokens', JSON.stringify({ access_token: 'test-access', refresh_token: 'test-refresh' }));
    window.pabloGoTo('step-18b');
  });
  await expect(enlace(page, 'step-18b')).toBeVisible();
  const destino = page.waitForURL(/\/auth\/sesion\?plan=free/);
  await enlace(page, 'step-18b').click();
  await destino;
  expect(page.url()).not.toContain('codigo=');
  expect(page.url()).toContain('access_token=test-access');
  expect(errores).toEqual([]);
});

test('control: ofrece «Seguir con Gratis» y no la salida discreta', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'control');
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await expect.poll(() => page.evaluate(() => window.__flagsLeidas.includes('onboarding-gratis'))).toBe(true);
  for (const step of ['step-18b', 'step-cuenta-pago']) {
    await page.evaluate(s => window.pabloGoTo(s), step);
    await expect(page.locator(`[data-step="${step}"] button`, { hasText: 'Seguir con Gratis' })).toBeVisible();
    await expect(enlace(page, step)).toHaveCount(1);
    await expect(enlace(page, step)).toBeHidden();
  }
});

test('afiliado: sin Gratis y sin la salida discreta (no entra al experimento)', async ({ page }) => {
  await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/onboarding?a=maria.p_23');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.documentElement.classList.contains('afiliado'))).toBe(true);
  expect(await page.evaluate(() => window.__flagsLeidas)).not.toContain('onboarding-gratis');
  for (const step of ['step-18b', 'step-cuenta-pago']) {
    await page.evaluate(s => window.pabloGoTo(s), step);
    await expect(page.locator(`[data-step="${step}"] button`, { hasText: 'Seguir con Gratis' })).toBeHidden();
    await expect(enlace(page, step)).toBeHidden();
  }
});

test('el registro desde la pauta no lleva variante', async ({ page }) => {
  const red = await sinRed(page);
  await conPosthog(page, 'sin_gratis');
  await page.goto('/?utm_source=facebook&utm_medium=paid&utm_campaign=prueba');
  await registrarse(page);
  await expect.poll(() => red.signups.length).toBe(1);
  expect(red.signups[0].data.atribucion?.ab).toBeUndefined();
});
