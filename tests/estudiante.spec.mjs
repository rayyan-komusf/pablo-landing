import { test, expect } from '@playwright/test';
const endpoint = '**/functions/v1/solicitud-estudiante';
async function localOnly(page) {
  await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4325') ? route.continue() : route.abort());
}
test('la beca cerrada impide enviar documentos', async ({ page }) => {
  await localOnly(page);
  await page.route(endpoint, route => route.fulfill({status:503,json:{disponible:false}}));
  await page.goto('/estudiante');
  await expect(page.locator('#beca-disponibilidad')).toContainText('disponibles pronto');
  await expect(page.locator('#submit-btn')).toBeDisabled();
  await expect(page.locator('#carne')).toBeDisabled();
});
test('solo confirma un recibo válido y permite reintentar un error', async ({ page }) => {
  await localOnly(page); let posts=0;
  await page.route(endpoint, route => {
    if(route.request().method()==='GET') return route.fulfill({json:{disponible:true}});
    posts++;
    return route.fulfill({json:posts===1?{}:{ok:true}});
  });
  await page.goto('/estudiante');
  await expect(page.locator('#submit-btn')).toBeEnabled();
  await page.locator('#correo-registrado').fill('test@example.invalid');
  await page.locator('#correo-edu').fill('test@uni.edu');
  await page.locator('#carne').setInputFiles({name:'carne.jpg',mimeType:'image/jpeg',buffer:Buffer.from([255,216,255,224,0,16,74,70,73,70,0,1])});
  await page.locator('#acepto').check();
  await page.locator('#submit-btn').click();
  await expect(page.locator('#form-error-msg')).toBeVisible();
  await expect(page.locator('#form-success')).toBeHidden();
  await page.locator('#submit-btn').click();
  await expect(page.locator('#form-success')).toBeVisible();
  await expect(page.locator('#form-success')).toContainText('Si cumple los requisitos');
  expect(posts).toBe(2);
  expect(await page.locator('#carne').inputValue()).toBe('');
});
