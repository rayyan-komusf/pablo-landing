import { test, expect } from '@playwright/test';

// Free → Premium (Sandra 30-oct-2026): la pauta (utm_medium=paid) compra
// registros al plan Gratis. Gratis se ve igual que en orgánico; el semanal sale
// de la pauta y los planes pagos muestran la oferta que cobra la app (mensual
// con 3 días de prueba, anual S/120). El orgánico ve y paga la lista: sus
// enlaces de compra llevan precio=lista. Solo el afiliado sigue sin Gratis.
const ANUNCIO = '/?utm_source=facebook&utm_medium=paid&utm_campaign=prueba&utm_content=prueba';

async function textosGratisVisibles(page) {
  return page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (el && /gratis/i.test(n.textContent) && el.getClientRects().length && !el.closest('#plantilla-gratis, .lm')) out.push(n.textContent.trim());
    }
    return out;
  });
}

/** Clic en el CTA de un plan → URL a la que la landing manda a la app. */
async function destinoDeCompra(page, selector) {
  const pedido = page.waitForRequest(/usapablo\.app\/pricing/);
  await page.locator(selector).click();
  return new URL((await pedido).url());
}

test.beforeEach(async ({ page }) => {
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, route => route.abort());
});

test('pauta: la landing ofrece Gratis y los CTAs van al onboarding', async ({ page }) => {
  await page.goto(ANUNCIO);
  await expect(page.locator('#hero-cta-btn .sin-gratis')).toBeHidden();
  await expect(page.locator('#hero-cta-btn .con-gratis')).toBeVisible();
  await expect(page.locator('#hero-cta-btn')).toHaveAttribute('href', /^\/onboarding\?.*utm_medium=paid/);
  await expect(page.locator('#finalcta-btn')).toHaveAttribute('href', /^\/onboarding\?/);
  expect((await textosGratisVisibles(page)).length).toBeGreaterThan(0);
});

test('pauta: /planes con Gratis, sin semanal y con la oferta', async ({ page }) => {
  await page.goto(ANUNCIO);
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeVisible();
  await expect(page.locator('.plan-semanal')).toBeHidden();
  await expect(page.locator('.plan-anual .plan-amount .precio-oferta')).toHaveText('S/.120');
  await expect(page.locator('.plan-anual .plan-amount .precio-lista')).toBeHidden();
  await expect(page.locator('.plan-anual .plan-discount-badge.precio-oferta')).toBeVisible();
  await expect(page.locator('.plan-mensual .precio-oferta').first()).toBeVisible();
  const url = await destinoDeCompra(page, '#pricing-annual-cta');
  expect(url.searchParams.get('plan')).toBe('anual');
  expect(url.searchParams.get('precio')).toBeNull();
});

test('orgánico: Gratis, los tres planes a precio de lista y precio=lista', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-cta-btn')).toHaveAttribute('href', '/onboarding');
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeVisible();
  await expect(page.locator('.plan-semanal')).toBeVisible();
  await expect(page.locator('.plan-anual .plan-amount .precio-lista')).toHaveText('S/.200');
  await expect(page.locator('.plan-anual .plan-amount .precio-oferta')).toBeHidden();
  await expect(page.locator('.plan-mensual .precio-oferta').first()).toBeHidden();
  const url = await destinoDeCompra(page, '#pricing-annual-cta');
  expect(url.searchParams.get('plan')).toBe('anual');
  expect(url.searchParams.get('precio')).toBe('lista');
});

test('cada página declara su propia URL canónica', async ({ page }) => {
  await page.goto('/planes');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/planes\/?$/);
});

// Link de afiliado (usapablo.com/?a=…): sin Gratis y CTAs a /planes, con
// «Te recomendó …» si el afiliado está autorizado (RPC afiliado_publico).
test('afiliado: sin Gratis, CTAs a /planes y aviso con su nombre', async ({ page }) => {
  await page.route(/rpc\/afiliado_publico/, route => {
    const { p_codigo } = route.request().postDataJSON();
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(p_codigo === 'maria.p_23' ? 'María' : null) });
  });
  await page.goto('/?a=maria.p_23');
  await expect(page.locator('[data-afiliado-aviso]')).toHaveText(/Te recomendó\s+María/);
  await expect(page.locator('#hero-cta-btn')).toHaveText(/Empieza ahora · S\/20 al mes/i);
  await expect(page.locator('#hero-cta-btn')).toHaveAttribute('href', /^\/planes/);
  expect(await textosGratisVisibles(page)).toEqual([]);
  // Sigue en las páginas siguientes (guardado 30 días), sin marcar la sesión como pauta.
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeHidden();
  await expect(page.locator('[data-afiliado-aviso]')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('pablo_pauta'))).toBeNull();
});

test('afiliado no autorizado: sin Gratis pero sin aviso', async ({ page }) => {
  await page.route(/rpc\/afiliado_publico/, route => route.fulfill({ contentType: 'application/json', body: 'null' }));
  await page.goto('/?a=intruso');
  await expect(page.locator('#hero-cta-btn')).toHaveText(/Empieza ahora · S\/20 al mes/i);
  await page.waitForTimeout(300);
  await expect(page.locator('[data-afiliado-aviso]')).toBeHidden();
});

test('pauta: el paywall del onboarding ofrece Gratis, mensual con prueba y anual S/120', async ({ page }) => {
  await page.goto('/onboarding?utm_source=facebook&utm_medium=paid');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await page.evaluate(() => window.pabloGoTo('step-18b'));
  const paso = page.locator('[data-step="step-18b"]');
  await expect(paso.getByRole('button', { name: 'Seguir con Gratis', exact: true })).toBeVisible();
  await expect(paso.locator('[data-pw-plan="anual"] .pw-plan__precio')).toHaveText(/S\/\.120/);
  await expect(paso.locator('[data-pw-plan="anual"] .pw-plan__precio .precio-lista')).toBeHidden();
  await expect(paso.locator('[data-pw-plan="mensual"] .precio-oferta')).toBeVisible();
  await expect(paso.locator('[data-pw-hoy]')).toContainText('Hoy no pagas nada');
  await expect(paso.getByRole('button', { name: 'Ver todos los planes' })).toBeHidden();
});

test('orgánico: el paywall del onboarding sigue con la lista', async ({ page }) => {
  await page.goto('/onboarding');
  await page.waitForFunction(() => typeof window.pabloGoTo === 'function');
  await page.evaluate(() => window.pabloGoTo('step-18b'));
  const paso = page.locator('[data-step="step-18b"]');
  await expect(paso.getByRole('button', { name: 'Seguir con Gratis', exact: true })).toBeVisible();
  await expect(paso.locator('[data-pw-plan="anual"] .pw-plan__precio .precio-lista')).toBeVisible();
  await expect(paso.locator('[data-pw-plan="anual"] .pw-plan__precio .precio-oferta')).toBeHidden();
  await expect(paso.locator('[data-pw-hoy]')).toContainText('El primer cobro se realiza al confirmar');
  await expect(paso.getByRole('button', { name: 'Ver todos los planes' })).toBeVisible();
});
