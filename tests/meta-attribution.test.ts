import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../src/components/MetaPixel.astro', import.meta.url), 'utf8');
const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
function run(url: string, storage = new Map<string,string>(), cookies = '') {
  const location = new URL(url); const listeners: Record<string,Function> = {};
  const document = { cookie: cookies, createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }], addEventListener: (name: string, fn: Function) => { listeners[name] = fn; } };
  const context: any = { location, URL, URLSearchParams, Date, pixelId: 'test-only', document,
    localStorage: { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string,v: string) => storage.set(k,v) } };
  context.window = context;
  vm.createContext(context); scripts.forEach(s => vm.runInContext(s, context));
  return context;
}
test('blocked Meta script still preserves full fbc across landing pages and the app redirect', () => {
  const storage = new Map<string,string>();
  const first = run('https://www.usapablo.com/?fbclid=AdClick_123', storage);
  const saved = first.pabloFbCookies().fbc;
  assert.match(saved, /^fb\.1\.\d{13}\.AdClick_123$/);
  const next = run('https://www.usapablo.com/onboarding', storage);
  assert.equal(next.pabloFbCookies().fbc, saved);
  const checkout = new URL(next.pabloConFbc('https://usapablo.app/pricing?plan=mensual'));
  assert.equal(checkout.searchParams.get('fbc'), saved); assert.equal(checkout.searchParams.get('plan'), 'mensual');
});
test('attribution does not leak to another site or a lookalike app hostname', () => {
  const app = run('https://www.usapablo.com/?fbclid=click');
  for (const url of ['https://attacker.test','https://usapablo.app.attacker.test','https://usapablo.app@attacker.test']) assert.equal(app.pabloConFbc(url), url);
});
test('expired attribution and malformed click ids are discarded', () => {
  const storage = new Map([['pablo_fb_atribucion_v1', JSON.stringify({ ts: Date.now()-8*86400000, fbc:'fb.1.1791216000000.old' })]]);
  assert.equal(run('https://www.usapablo.com/?fbclid=%3Cscript%3E', storage).pabloFbCookies().fbc, null);
});
test('PageView identifies the visited path without copying fragment or query secrets', () => {
  for (const path of ['/onboarding', '/blog/ahorro']) {
    const app = run('https://www.usapablo.com'+path+'?email=private#access_token=test');
    const event = app.fbq.queue.find((args: any) => args[1] === 'PageView');
    assert.equal(event[2].page_location, 'https://www.usapablo.com'+path); assert.equal(event[2].page_path, path);
  }
});
test('paid landing gate exists independently of pixel availability and storage', () => {
  const popup = readFileSync(new URL('../src/components/MonedaPopup.astro', import.meta.url), 'utf8');
  const gate = popup.slice(popup.indexOf('const esPauta ='), popup.indexOf('const path = location.pathname'));
  for (const paid of [true, false]) {
    const c: any = { location: { search: paid ? '?utm_medium=paid' : '' }, URLSearchParams, document: { documentElement: { classList: { contains: () => false } } } };
    assert.equal(vm.runInNewContext('(function(){try {'+gate+'return true;})()', c), paid ? undefined : true);
  }
});
