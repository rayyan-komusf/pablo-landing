import { test, expect } from '@playwright/test';

// Sandra 07-oct-2026: al tráfico pagado (utm_medium=paid) no se le ofrece el
// plan Gratis; el orgánico no cambia.
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

test.beforeEach(async ({ page }) => {
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, route => route.abort());
});

test('pauta: la landing no ofrece Gratis y los CTAs van a /planes', async ({ page }) => {
  await page.goto(ANUNCIO);
  await expect(page.locator('#hero-cta-btn')).toHaveText(/Empieza ahora · S\/20 al mes/i);
  await expect(page.locator('#hero-cta-btn')).toHaveAttribute('href', /^\/planes\?.*utm_medium=paid/);
  await expect(page.locator('#finalcta-btn')).toHaveAttribute('href', /^\/planes\?/);
  expect(await textosGratisVisibles(page)).toEqual([]);
});

test('pauta: /planes sin el bloque Gratis', async ({ page }) => {
  await page.goto(ANUNCIO);
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeHidden();
  expect(await textosGratisVisibles(page)).toEqual([]);
});

test('orgánico: sigue ofreciendo Gratis', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-cta-btn')).toHaveAttribute('href', '/onboarding');
  await page.goto('/planes');
  await expect(page.locator('.free-plan')).toBeVisible();
});

test('cada página declara su propia URL canónica', async ({ page }) => {
  await page.goto('/planes');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/planes\/?$/);
});

// Link de afiliado (usapablo.com/?a=…): mismo modo sin Gratis que la pauta,
// con «Te recomendó …» si el afiliado está autorizado (RPC afiliado_publico).
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
