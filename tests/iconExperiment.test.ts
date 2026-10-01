import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code = readFileSync(new URL('../src/scripts/iconExperiment.js', import.meta.url), 'utf8');
const key = 'pablo_icons_ab_v1';
function run({cached = null, result = 'test', blocked = false, hostname = 'usapablo.com', search = ''}: any = {}) {
  const values = new Map<string,string>();
  if(cached) values.set(key, JSON.stringify(cached));
  const listeners: Record<string,Function> = {}, attrs: Record<string,string> = {};
  const reads: any[] = [], registrations: any[] = [], timers: Function[] = [];
  let onFlags: Function = () => {};
  const context: any = {
    Date, JSON, URLSearchParams, location:{hostname,search},
    localStorage: {getItem:(k: string)=>{if(blocked)throw Error('blocked');return values.get(k)},setItem:(k:string,v:string)=>{if(blocked)throw Error('blocked');values.set(k,v)},removeItem:(k:string)=>values.delete(k)},
    document:{readyState:'complete',documentElement:{setAttribute:(k:string,v:string)=>attrs[k]=v},querySelector:()=>({}),addEventListener:(e:string,fn:Function)=>listeners[e]=fn},
    setTimeout:(fn:Function)=>{timers.push(fn)},
    posthog:{onFeatureFlags:(fn:Function)=>onFlags=fn,getFeatureFlag:(flag:string,opts:any)=>{reads.push({flag,opts});return result},register:(p:any)=>registrations.push(p)}
  };
  context.window=context;
  vm.runInNewContext(code,context);
  return {attrs, reads, values, registrations, fire:()=>onFlags(), interact:()=>listeners.pointerdown(), expire:()=>timers[0](), set:(v:any)=>result=v, state:context.pabloIconExperiment};
}
test('only a confirmed PostHog assignment creates exposure, exactly once',()=>{
 const s=run();assert.equal(s.state.variant(),'control');assert.equal(s.reads.length,0);
 s.fire();s.fire();assert.equal(s.attrs['data-icons-variant'],'test');assert.equal(s.reads.filter(r=>!r.opts).length,1);assert.equal(s.state.confirmed(),true);
});
test('control is an explicit 50/50 arm, not a missing flag',()=>{
 const s=run({result:'control'});s.fire();assert.equal(s.attrs['data-icons-variant'],'control');assert.equal(s.reads.filter(r=>!r.opts).length,1);
});
test('cached visuals are not counted before the server confirms them',()=>{
 const s=run({cached:{variant:'test',at:Date.now()},result:undefined});s.set(undefined);
 assert.equal(s.attrs['data-icons-variant'],'test');s.fire();assert.equal(s.state.confirmed(),false);assert.equal(s.reads.filter(r=>!r.opts).length,0);
});
test('disabled flag clears stale assignment and never creates an exposure',()=>{
 const s=run({cached:{variant:'test',at:Date.now()},result:false});s.fire();assert.equal(s.attrs['data-icons-variant'],'control');assert.equal(s.values.has(key),false);assert.equal(s.reads.filter(r=>!r.opts).length,0);
});
test('late treatment is deferred after interaction instead of changing the page',()=>{
 const s=run();s.interact();s.fire();assert.equal(s.state.variant(),'control');assert.equal(s.state.confirmed(),false);assert.equal(JSON.parse(s.values.get(key)!).variant,'test');
});
test('slow flag cannot change the design after first-render grace period',()=>{
 const s=run();s.expire();s.fire();assert.equal(s.state.variant(),'control');assert.equal(s.reads.filter(r=>!r.opts).length,0);
});
test('unavailable storage never blocks assignment or navigation',()=>{
 const s=run({blocked:true});s.fire();assert.equal(s.state.variant(),'test');assert.equal(s.state.confirmed(),true);
});
test('preview is local only and creates no exposure or persistent override',()=>{
 const local=run({hostname:'127.0.0.1',search:'?icons-preview=test'});local.fire();assert.equal(local.state.variant(),'test');assert.equal(local.reads.length,0);assert.equal(local.values.size,0);
 const production=run({search:'?icons-preview=test',result:'control'});production.fire();assert.equal(production.state.variant(),'control');assert.equal(production.state.confirmed(),true);
});
test('malformed, expired and future cache entries cannot select treatment',()=>{
 for(const cached of [{variant:'other',at:Date.now()},{variant:'test',at:1},{variant:'test',at:Date.now()+999999}])assert.equal(run({cached}).state.variant(),'control');
});

test('early interaction excludes control too, avoiding asymmetric enrollment',()=>{
 const s=run({result:'control'});s.interact();s.fire();assert.equal(s.state.confirmed(),false);assert.equal(s.reads.filter(r=>!r.opts).length,0);
});
