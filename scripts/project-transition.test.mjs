import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { imageLanding, parseProjectRoute, rectClip, titleLanding } from '../app/project-transition-geometry.ts';
const origin='http://127.0.0.1:8001';
const slugs=['gkx','tax-cloud'];

test('client navigation preserves project URLs and legacy views',()=>{
 assert.deepEqual(parseProjectRoute('/portfolio/project/gkx/?from=portfolio&returnY=788#nsp-rules',origin,slugs),{url:'/portfolio/project/gkx/?from=portfolio&returnY=788#nsp-rules',projectSlug:'gkx',projectView:undefined});
 assert.equal(parseProjectRoute('/portfolio/project/gkx/systems/',origin,slugs).projectView,'systems');
 assert.equal(parseProjectRoute('/portfolio/#work',origin,slugs).projectSlug,undefined);
});

test('external, unknown and malformed destinations retain native navigation',()=>{
 for(const url of ['https://example.com/portfolio/project/gkx/','javascript:alert(1)','/portfolio/project/unknown/','/portfolio/project/%2Fgkx/','/portfolio/project/gkx/extra/path','/portfolio/project/%ZZ/','/portfolio/assets/demo.html']) assert.equal(parseProjectRoute(url,origin,slugs),null,url);
});

test('moving between differently shaped image frames preserves image proportions',()=>{
 for(const [a,b] of [
  [{left:10,top:20,width:520,height:560},{left:80,top:440,width:1200,height:338}],
  [{left:0,top:-120,width:360,height:480},{left:16,top:120,width:358,height:200}],
 ]){
  const geometry=imageLanding(a,b,1920,1080);
  assert.ok(Math.abs(geometry.sx*geometry.imageX-geometry.sy*geometry.imageY)<1e-9,'combined image scale must be uniform');
  const reverse=imageLanding(b,a,1920,1080);
  assert.ok(Math.abs(reverse.sx*reverse.imageX-reverse.sy*reverse.imageY)<1e-9);
 }
});

test('partially offscreen cards get valid viewport masks',()=>{
 assert.equal(rectClip({left:-20,top:-80,width:420,height:1100},390,843),'inset(0px 0px 0px 0px round 12px)');
 assert.equal(rectClip({left:80,top:100,width:1200,height:600},1354,727),'inset(100px 74px 27px 80px round 12px)');
});

test('project lettering changes size uniformly without horizontal stretching',()=>{
 assert.equal(titleLanding({left:60,top:120,width:400,height:64},{left:80,top:100,width:1200,height:76},48,64),'translate(20px, -20px) scale(1.3333333333333333)');
});

// Run the navigation hook with a small document and immediate reduced-motion
// animations. This exercises history, failure cleanup and focus without a server.
const navigationCode = ts.transpileModule(readFileSync(new URL('../app/project-transition.ts', import.meta.url), 'utf8'), {
 compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function navigationHarness(initial = {}, prepare = () => Promise.resolve(), { showcase = false, selected = 'gkx' } = {}) {
 const events = new EventTarget();
 const documentEvents = new EventTarget();
 const timers = new Set();
 const assigned = [];
 const pushed = [];
 const replaced = [];
 const played = [];
 const selections = [];
 const session = new Map();
 let activeProject = selected;
 let currentUrl = new URL(initial.projectSlug ? `/portfolio/project/${initial.projectSlug}/` : '/portfolio/', origin);
 let mounted = initial;
 let focused;
 let cleanup;
 let context;
 class Element extends EventTarget {
  constructor(name = '', text = '') {
   super(); this.name = name; this.textContent = text; this.style = {}; this.dataset = {}; this.attributes = new Map(); this.children = [];
   const classes = new Set();
   this.classList = { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) };
  }
  append(child) { child.parent = this; this.children.push(child); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
  getBoundingClientRect() { return { left: 30, top: 100, width: 600, height: 320 }; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) {
   this.attributes.delete(name);
   if (name.startsWith('data-')) delete this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())];
  }
  querySelector(selector) { return this.queries?.[selector] ?? null; }
  closest(selector) { return selector === '.project-showcase' && showcase && this.name === 'card' ? showcaseRoot : null; }
  focus() { focused = this; }
  animate(frames) { played.push(frames); return { finished: Promise.resolve(), cancel() {} }; }
 }
 const body = new Element('body');
 const root = new Element('html'); root.lang = 'en';
 const scene = new Element('scene');
 const showcaseRoot = new Element('showcase');
 const names = { gkx: 'GKX Smart Portal', 'tax-cloud': 'Tax Cloud' };
 const cards = Object.entries(names).map(([slug, name]) => {
  const card = new Element('card'); card.dataset.project = slug;
  const title = new Element('card-title', name);
  card.queries = { h3: title, '.project-copy h3': title, '.project-card-link': new Element('card-link', name), '.project-exhibit-toggle': new Element('toggle', name), '.project-visual': null };
  return card;
 });
 const syncSelection = () => cards.forEach(card => {
  const expanded = !showcase || card.dataset.project === activeProject;
  card.classList[expanded ? 'add' : 'remove']('is-expanded');
  const link = card.queries['.project-card-link'];
  link.setAttribute('aria-hidden', String(!expanded));
  if (expanded) link.removeAttribute('inert'); else link.setAttribute('inert', '');
 });
 syncSelection();
 events.addEventListener('portfolio-showcase-select', event => {
  if (!showcase || mounted.projectSlug) return;
  const slug = event.detail.slug;
  selections.push(slug);
  activeProject = slug;
  syncSelection();
  session.set('portfolio-showcase-active-project', slug);
 });
 const titles = Object.fromEntries(Object.entries(names).map(([slug, name]) => [slug, new Element('case-title', name)]));
 const hero = new Element('hero');
 const document = {
  body, documentElement: root, title: 'Portfolio', createElement: () => new Element(),
  querySelectorAll: selector => selector === '.project-card' && !mounted.projectSlug ? cards : [],
  querySelector: selector => {
   if (selector === '.portfolio-route-scene') return scene;
   if (selector === '.gkx-hero, .zc4-hero, .case-hero') return mounted.projectSlug ? hero : null;
   if (selector.startsWith('[data-project-motion-title]') || selector === 'main h1') return titles[mounted.projectSlug] ?? null;
   return null;
  },
  addEventListener: documentEvents.addEventListener.bind(documentEvents),
  removeEventListener: documentEvents.removeEventListener.bind(documentEvents),
 };
 const location = {
  get href() { return currentUrl.href; }, get origin() { return currentUrl.origin; },
  get pathname() { return currentUrl.pathname; }, get search() { return currentUrl.search; }, get hash() { return currentUrl.hash; },
  assign(url) { assigned.push(url); },
 };
 const history = {
  state: {}, scrollRestoration: 'auto',
  pushState(state, _, url) { this.state = state; pushed.push({ state, url }); if (url) currentUrl = new URL(url, currentUrl); },
  replaceState(state, _, url) { this.state = state; replaced.push({ state, url }); if (url) currentUrl = new URL(url, currentUrl); },
 };
 const exports = {};
 context = {
  exports, document, location, history, URL, Event, DOMException, AbortController, HTMLElement: Element, HTMLImageElement: Element,
  CustomEvent: class extends Event { constructor(name, options) { super(name, options); this.detail = options.detail; } },
  KeyboardEvent: class extends Event {},
  performance, innerWidth: 1366, innerHeight: 900, scrollY: 640,
  matchMedia: () => ({ matches: true }),
  scrollTo({ top }) { context.scrollY = top; },
  setTimeout(callback, ms) { const timer = setTimeout(callback, ms); timers.add(timer); return timer; },
  clearTimeout(timer) { clearTimeout(timer); timers.delete(timer); },
  addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
  require(name) {
   if (name === 'react') return {
    useState(value) { return [typeof value === 'function' ? value() : value, next => { mounted = next; }]; },
    useRef(value) { return { current: value }; }, useLayoutEffect(effect) { cleanup = effect(); },
   };
   if (name === 'react-dom') return { flushSync: callback => callback() };
   if (name === './home-scroll') return { cancelHomeScroll() {} };
   if (name === './project-transition-geometry') return { imageLanding, parseProjectRoute, rectClip, titleLanding };
   if (name.endsWith('.css')) return {};
   throw new Error(`Unexpected dependency: ${name}`);
  },
 };
 context.window = context;
 vm.runInNewContext(navigationCode, context);
 exports.useProjectNavigation(initial, { slugs, prepare });
 return {
  assigned, pushed, replaced, played, history, cards, root, body, selections, session,
  get route() { return mounted; }, get focused() { return focused; }, get scrollY() { return context.scrollY; },
  request(slug, direction = 'forward', keyboard = false, url = `/portfolio/project/${slug}/`) {
   const trigger = new Element('trigger');
   exports.requestProjectNavigation({ url, slug, direction, keyboard, trigger });
   return trigger;
  },
  pop(url, state) { currentUrl = new URL(url, origin); history.state = state; events.dispatchEvent(new Event('popstate')); },
  scroll(y) { context.scrollY = y; events.dispatchEvent(new Event('scroll')); },
  interrupt() { events.dispatchEvent(new Event('wheel')); },
  announcement() { return body.children.find(child => child.className === 'project-route-announcement')?.textContent; },
  dispose() { cleanup?.(); timers.forEach(clearTimeout); },
 };
}

const settleNavigation = () => new Promise(resolve => setImmediate(resolve));

test('a failed prefetch retains the link by falling back to native navigation', async () => {
 const app = navigationHarness({}, () => Promise.reject(new Error('Chunk unavailable')));
 try {
  const trigger = app.request('gkx');
  await settleNavigation();
  assert.deepEqual(app.assigned, ['/portfolio/project/gkx/']);
  assert.equal(app.pushed.length, 0);
  assert.equal(trigger.hasAttribute('aria-busy'), false);
  assert.equal(app.body.children.some(child => child.className === 'project-motion-layer'), false);
 } finally { app.dispose(); }
});

test('cancelled prefetches never trigger a delayed native navigation', async () => {
 let rejectPreparation;
 const app = navigationHarness({}, () => new Promise((_, reject) => { rejectPreparation = reject; }));
 try {
  app.request('gkx');
  app.interrupt();
  rejectPreparation(new Error('Chunk unavailable'));
  await settleNavigation();
  assert.deepEqual(app.assigned, []);
  assert.equal(app.root.dataset.projectMotion, undefined);
 } finally { app.dispose(); }
});

test('next-project navigation never records a case scroll position as a homepage return', async () => {
 const app = navigationHarness({ projectSlug: 'gkx' });
 const homeReturn = { portfolioCardReturn: { slug: 'gkx', y: 640 } };
 app.history.state = homeReturn;
 try {
  app.scroll(4800);
  app.request('tax-cloud');
  await settleNavigation();
  assert.equal(app.route.projectSlug, 'tax-cloud');
  const sourceEntry = app.replaced.find(entry => entry.state.portfolioCardReturn?.slug === 'gkx');
  assert.equal(sourceEntry.state.portfolioCardReturn.y, 640, 'the previous project keeps its original homepage return');
  assert.equal(sourceEntry.state.portfolioRoutePosition.y, 4800, 'case reading position is stored separately');
  assert.equal(app.pushed[0].state.portfolioCardReturn.slug, 'tax-cloud');
  assert.equal(app.pushed[0].state.portfolioCardReturn.y, undefined);
  app.request('tax-cloud', 'back', true, '/portfolio/?returnProject=tax-cloud&returnSection=work');
  await settleNavigation();
  assert.equal(app.route.homeRestore.slug, 'tax-cloud');
  assert.ok(Number.isNaN(app.route.homeRestore.y), 'the homepage locates the target card when there was no homepage origin');
 } finally { app.dispose(); }
});

test('case Back and Forward restore each history entry reading position independently', async () => {
 const app = navigationHarness({ projectSlug: 'gkx' });
 try {
  app.history.state = { ...app.history.state, portfolioCardReturn: { slug: 'gkx', y: 640 } };
  app.scroll(4800);
  app.request('tax-cloud');
  await settleNavigation();
  const gkxEntry = app.replaced.find(entry => entry.state.portfolioCardReturn?.slug === 'gkx').state;
  const taxEntry = app.history.state;
  app.scroll(2100);
  app.pop('/portfolio/project/gkx/', gkxEntry);
  await settleNavigation();
  assert.equal(app.route.projectSlug, 'gkx');
  assert.equal(app.scrollY, 4800, 'Back returns to the earlier case footer');
  assert.equal(app.history.state.portfolioCardReturn.y, 640, 'the original homepage return remains intact');
  app.pop('/portfolio/project/tax-cloud/', taxEntry);
  await settleNavigation();
  assert.equal(app.route.projectSlug, 'tax-cloud');
  assert.equal(app.scrollY, 2100, 'Forward returns to the next case reading position');
  assert.equal(app.history.state.portfolioCardReturn.y, undefined, 'case scroll positions never become homepage coordinates');
 } finally { app.dispose(); }
});

test('history returns restore the project link focus and announce the destination', async () => {
 const app = navigationHarness({ projectSlug: 'gkx' });
 try {
  app.pop('/portfolio/#work', { portfolioCardReturn: { slug: 'gkx', y: 640 } });
  await settleNavigation();
  assert.equal(app.route.projectSlug, undefined);
  assert.equal(app.route.homeRestore.y, 640);
  assert.equal(app.focused, app.cards[0].queries['.project-card-link']);
  assert.equal(app.announcement(), 'Returned to selected work: GKX Smart Portal');
  assert.equal(app.pushed.length, 0);
  assert.ok(app.played.every(frames => frames.every(frame => !('transform' in frame))), 'reduced motion omits travel');
 } finally { app.dispose(); }
});

test('returning from a case expands the requested exhibit before restoring focus', async () => {
 const app = navigationHarness({ projectSlug: 'gkx' }, undefined, { showcase: true, selected: 'tax-cloud' });
 try {
  assert.equal(app.cards[0].queries['.project-card-link'].hasAttribute('inert'), true);
  app.request('gkx', 'back', true, '/portfolio/?returnProject=gkx&returnY=640');
  await settleNavigation();
  assert.deepEqual(app.selections, ['gkx']);
  assert.equal(app.cards[0].classList.contains('is-expanded'), true);
  assert.equal(app.cards[1].classList.contains('is-expanded'), false);
  assert.equal(app.session.get('portfolio-showcase-active-project'), 'gkx');
  assert.equal(app.route.homeRestore.y, 640);
  assert.equal(app.focused, app.cards[0].queries['.project-card-link']);
  assert.equal(app.focused.hasAttribute('inert'), false);
  assert.equal(app.focused.getAttribute('aria-hidden'), 'false');
 } finally { app.dispose(); }
});

test('browser Back restores a collapsed exhibit as the active, focusable project', async () => {
 const app = navigationHarness({ projectSlug: 'tax-cloud' }, undefined, { showcase: true, selected: 'gkx' });
 try {
  app.pop('/portfolio/#work', { portfolioCardReturn: { slug: 'tax-cloud', y: 920 } });
  await settleNavigation();
  assert.deepEqual(app.selections, ['tax-cloud']);
  assert.equal(app.cards[1].classList.contains('is-expanded'), true);
  assert.equal(app.session.get('portfolio-showcase-active-project'), 'tax-cloud');
  assert.equal(app.route.homeRestore.y, 920);
  assert.equal(app.focused, app.cards[1].queries['.project-card-link']);
  assert.equal(app.announcement(), 'Returned to selected work: Tax Cloud');
 } finally { app.dispose(); }
});
