import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

// Exercise the shipped video loader and logo handoff, without
// depending on a browser or waiting eight real seconds for the timeout case.
const html = await readFile(new URL("../github-pages/index.html", import.meta.url), "utf8");
const loaderScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .filter(source => source.includes("const waitForCriticalContent"));
assert.equal(loaderScripts.length, 1, "Expected exactly one actual inline loader script.");
const loaderSource = loaderScripts[0];
const preludeSource = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(source => source.includes('const replay = params.get("intro")'));
assert.ok(preludeSource, "Expected the actual entry/replay policy.");

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function classList() {
  const values = new Set();
  return {
    add: (...classes) => classes.forEach(value => values.add(value)),
    remove: (...classes) => classes.forEach(value => values.delete(value)),
    contains: value => values.has(value),
  };
}

function element() {
  const listeners = new Map();
  return {
    classList: classList(),
    hidden: false,
    textContent: "",
    removed: false,
    style: {},
    addEventListener(event, listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(listener);
    },
    removeEventListener(event, listener) { listeners.get(event)?.delete(listener); },
    emit(event) { for (const listener of listeners.get(event) ?? []) listener({ type: event }); },
    remove() { this.removed = true; },
  };
}

function scenario({ page = "hero", decode, fonts, capabilityState = "ready", introFinished = true, rejectPlay = false, reducedMotion = false, width = 1280, height = 720, seen = false, animated = false } = {}) {
  let now = 0;
  let nextId = 0;
  const jobs = [];
  const observers = new Set();
  const resourceListeners = new Map();
  const dispatched = [];
  const loader = element();
  const mark = element();
  const animation = { frames: [], options: null, canceled: false };
  if (animated) mark.animate = (frames, options) => {
    animation.frames = frames;
    animation.options = options;
    return { finished: Promise.resolve(), cancel() { animation.canceled = true; } };
  };
  const windowListeners = new Map();
  const introVideo = {
    ...element(), ended: introFinished, readyState: 4, paused: false,
    canPlayType: () => "probably",
    play() { this.paused = false; return rejectPlay ? Promise.reject(new Error("Autoplay denied")) : Promise.resolve(); },
    pause() { this.paused = true; },
  };
  const documentClasses = classList();
  documentClasses.add(seen ? "portfolio-loader-seen" : "portfolio-loading");

  const image = {
    complete: true,
    naturalWidth: 100,
    currentSrc: "/portfolio/assets/optimized/visual/hero-poster-desktop.webp",
    src: "/portfolio/assets/optimized/visual/hero-poster-desktop.webp",
    decode: decode ?? (() => Promise.resolve()),
  };
  const video = { dataset: { preloadState: "pending" }, readyState: 0 };
  const capability = page === "hero" ? { dataset: { renderer: capabilityState } } : null;
  const hero = {
    querySelector(selector) {
      if (selector === "video") return video;
      if (selector === ".hero-poster img") return image;
      throw new Error(`Unsupported hero selector in loader test: ${selector}`);
    },
  };
  const project = {
    image: null,
    loading: true,
    failedImage: false,
    querySelector(selector) {
      if (selector === ".case-loading") return this.loading ? element() : null;
      if (selector === '[data-case-ready="text"]') return this.textReady ? element() : null;
      if (selector === ".image-fallback") return this.failedImage ? element() : null;
      if (selector === 'img[loading="eager"], img[fetchpriority="high"]') return this.image;
      throw new Error(`Unsupported project selector in loader test: ${selector}`);
    },
  };
  const root = {
    childElementCount: 1,
    querySelector(selector) {
      if (selector === ".hero") return page === "hero" ? hero : null;
      if (selector === "main[data-project]") return page === "project" ? project : null;
      if (selector === ".not-found") return page === "not-found" ? element() : null;
      if (selector === "[data-ability-visual]") return capability;
      throw new Error(`Unsupported root selector in loader test: ${selector}`);
    },
    addEventListener(event, listener) {
      if (!resourceListeners.has(event)) resourceListeners.set(event, new Set());
      resourceListeners.get(event).add(listener);
    },
    removeEventListener(event, listener) {
      resourceListeners.get(event)?.delete(listener);
    },
  };
  const nodes = {
    "portfolio-boot": loader,
    "portfolio-boot-video": introVideo,
    "portfolio-boot-mark": mark,
    root,
  };
  const schedule = (callback, delay) => {
    const id = ++nextId;
    jobs.push({ id, at: now + delay, callback });
    return id;
  };
  const cancel = id => {
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) jobs.splice(index, 1);
  };
  const context = {
    document: {
      documentElement: { classList: documentClasses },
      body: { appendChild(node) { node.parent = "body"; } },
      visibilityState: "visible",
      addEventListener() {},
      removeEventListener() {},
      fonts: { ready: fonts ?? Promise.resolve() },
      getElementById: id => nodes[id] ?? null,
      querySelector(selector) {
        if (selector !== ".site-nav .brand-logo") return null;
        const compact = width <= 767;
        return {
          getBoundingClientRect: () => ({ left: compact ? 26 : 32, top: compact ? 10 : 12, width: compact ? 24 : 28, height: compact ? 24 : 28 }),
          closest: () => ({ getBoundingClientRect: () => ({ left: 0, top: -10 }) }),
        };
      },
    },
    innerWidth: width,
    innerHeight: height,
    history: { scrollRestoration: "auto" },
    scrollTo() {},
    addEventListener(name, listener) { windowListeners.set(name, listener); },
    removeEventListener(name) { windowListeners.delete(name); },
    getComputedStyle: () => ({ left: "0px", top: "0px" }),
    performance: { now: () => now },
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame: callback => schedule(() => callback(now), 16),
    cancelAnimationFrame: cancel,
    setTimeout: (callback, delay) => schedule(callback, delay),
    clearTimeout: cancel,
    sessionStorage: { setItem() {} },
    Event: class { constructor(type) { this.type = type; } },
    dispatchEvent(event) {
      assert.equal(loader.removed, true, "The hero reveal signal must wait until the loader has left.");
      assert.equal(documentClasses.contains("portfolio-loading"), false, "The hero reveal signal must follow page unlock.");
      assert.equal(documentClasses.contains("portfolio-lj-intro-complete"), true, "Hero must see the fast parallel handoff timing before its entrance starts.");
      dispatched.push(event.type);
    },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(_target, options) { this.options = options; observers.add(this); }
      disconnect() { observers.delete(this); }
    },
  };
  context.window = context;
  vm.runInNewContext(loaderSource, context, { filename: "github-pages/index.html:inline-loader" });

  return {
    introVideo,
    mark,
    animation,
    resizeTo(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      context.innerWidth = width;
      context.innerHeight = height;
      windowListeners.get("resize")?.();
    },
    classes: documentClasses,
    dispatched,
    image,
    video,
    capability,
    project,
    loader,
    assertWaiting(message) {
      assert.deepEqual(dispatched, [], "Hero entrance must not start behind a waiting loader.");
      assert.equal(loader.removed, false, message);
      assert.equal(documentClasses.contains("portfolio-loading"), true, message);
    },
    assertRevealed(message) {
      assert.equal(loader.removed, true, message);
      assert.equal(documentClasses.contains("portfolio-loading"), false, message);
      assert.deepEqual(dispatched, ["portfolio-loader-exit"], "Every finished loader must emit its entrance signal exactly once.");
    },
    changed(attributeName) {
      for (const observer of [...observers]) {
        if (attributeName && (!observer.options.attributes ||
          (observer.options.attributeFilter && !observer.options.attributeFilter.includes(attributeName)))) continue;
        observer.callback(attributeName ? [{ type: "attributes", attributeName }] : []);
      }
    },
    resourceEvent(event) {
      for (const listener of resourceListeners.get(event) ?? []) listener();
    },
    async advance(milliseconds) {
      // Native promise callbacks run at the current time even when the new
      // video loader is idle and has no progress-counter RAF loop scheduled.
      for (let turn = 0; turn < 4; turn += 1) await Promise.resolve();
      const until = now + milliseconds;
      while (true) {
        jobs.sort((a, b) => a.at - b.at || a.id - b.id);
        const job = jobs[0];
        if (!job || job.at > until) break;
        jobs.shift();
        now = job.at;
        job.callback();
        // Let the actual loader's image.decode()/fonts promise chains settle.
        await Promise.resolve();
        await Promise.resolve();
      }
      now = until;
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

const checks = [
  ["staged motion preserves its destination and releases the animation layer", async () => {
    const test = scenario({ animated: true });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(3000);
    test.assertRevealed("Detailed motion must still release the loader.");
    assert.ok(test.animation.frames.length >= 4);
    assert.equal(test.animation.frames[0].offset, 0);
    assert.equal(test.animation.frames.at(-1).offset, 1);
    assert.equal(test.animation.frames.at(-1).transform, test.mark.style.transform);
    assert.ok(test.animation.options.duration <= 600, "Extra detail must retain a short docking budget.");
    assert.equal(test.animation.canceled, true, "The finished fill layer must not outlive the handoff.");
  }],
  ["resize interrupts staged motion and aligns to the new navigation", async () => {
    const test = scenario({ animated: true });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(350);
    assert.ok(test.animation.options, "Docking must have started.");
    test.resizeTo(390, 844);
    await test.advance(1000);
    test.assertRevealed("A resize must not leave the loading page locked.");
    assert.equal(test.animation.canceled, true);
    assert.equal(test.mark.style.left, "26px");
    assert.equal(test.mark.style.top, "20px");
    assert.equal(test.mark.style.width, "24px");
    assert.equal(test.mark.style.transform, "none");
  }],
  ...[
    ["normal revisits skip the intro", "", true, false, "portfolio-loader-seen"],
    ["returning to work skips even when storage is unavailable", "?returnProject=gkx&returnY=600", false, true, "portfolio-loader-seen"],
    ["legacy review URL cannot replay a seen intro", "?intro=replay", true, false, "portfolio-loader-seen"],
    ["refresh skips even when the previous review URL remains", "?intro=replay", true, false, "portfolio-loader-seen", "reload"],
    ["refreshing during an unfinished first intro still skips", "", false, false, "portfolio-loader-seen", "reload"],
    ["back-forward never starts another intro", "", false, true, "portfolio-loader-seen", "back_forward"],
    ["fresh entry plays and marks the visit immediately", "", false, false, "portfolio-loading", "navigate"],
  ].map(([name, search, stored, storageFails, expected, navigationType = "navigate"]) => [name, async () => {
    const classes = classList();
    let written;
    let replacedUrl;
    const scrolls = [];
    const history = { state: null, scrollRestoration: navigationType === "reload" ? "manual" : "auto", replaceState(_state, _title, url) { replacedUrl = url; } };
    const context = { document: { documentElement: { classList: classes, dataset: {} } }, URLSearchParams, URL,
      performance: { getEntriesByType: () => [{ type: navigationType }] },
      sessionStorage: {
        getItem() { if (storageFails) throw new Error("Storage unavailable"); return stored ? "1" : null; },
        setItem(_key, value) { if (storageFails) throw new Error("Storage unavailable"); written = value; },
      } };
    context.window = { location: { search, href: `http://localhost/portfolio/${search}` }, history, scrollTo(position) { scrolls.push(position); } };
    vm.runInNewContext(preludeSource, context);
    assert.ok(classes.contains(expected));
    assert.equal(classes.contains(expected === "portfolio-loading" ? "portfolio-loader-seen" : "portfolio-loading"), false);
    if (!storageFails) assert.equal(written, "1", "Visit state must be recorded before the film completes.");
    assert.equal(history.scrollRestoration, expected === "portfolio-loading" ? "manual" : "auto");
    assert.equal(scrolls.length, expected === "portfolio-loading" ? 1 : 0, "Only a real intro may reset the reading position.");
    if (search.includes("intro=")) assert.equal(replacedUrl.includes("intro="), false, "A review parameter cannot survive into a refresh.");
  }]),
  ["ready content waits for the supplied intro to finish", async () => {
    const test = scenario({ introFinished: false });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(5000);
    test.assertWaiting("Ready content must not bypass the supplied intro's ended event.");
    test.introVideo.ended = true;
    test.introVideo.emit("ended");
    await test.advance(1800);
    test.assertRevealed("Video ending must dock the mark and then reveal ready content.");
  }],
  ["logo docks to the settled header before Hero starts", async () => {
    const test = scenario();
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(3000);
    test.assertRevealed("The completed intro must release the page.");
    assert.equal(test.mark.style.left, "535px");
    assert.equal(test.mark.style.top, "260px");
    assert.equal(test.mark.style.transform, "translate3d(-503px, -238px, 0) scale(0.14, 0.14)");
    assert.equal(test.mark.parent, "body", "The docking mark must survive removal of the white loader.");
    assert.equal(test.mark.removed, true, "The duplicate mark must be removed after the nav settles.");
    assert.equal(test.classes.contains("portfolio-logo-handoff"), false);
  }],
  ["mobile docking uses the 24px navigation target", async () => {
    const test = scenario({ width: 390, height: 844 });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(3000);
    test.assertRevealed("Mobile intro must release after the same handoff.");
    const match = test.mark.style.transform.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px, 0\) scale\(([-.\d]+), ([-.\d]+)\)/);
    assert.ok(match);
    assert.ok(Math.abs(Number.parseFloat(test.mark.style.left) + Number(match[1]) - 26) < .001);
    assert.ok(Math.abs(Number.parseFloat(test.mark.style.top) + Number(match[2]) - 20) < .001);
    assert.ok(Math.abs(Number.parseFloat(test.mark.style.width) * Number(match[3]) - 24) < .001);
  }],
  ["autoplay rejection falls back to the same static mark", async () => {
    const test = scenario({ introFinished: false, rejectPlay: true });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(3000);
    test.assertRevealed("Blocked autoplay cannot trap the site behind the loader.");
  }],
  ["intro error and a late ended event reveal only once", async () => {
    const test = scenario({ introFinished: false });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    test.introVideo.emit("error");
    await test.advance(3000);
    test.assertRevealed("A failed intro must fall back instead of blocking the page.");
    test.introVideo.emit("ended");
    await test.advance(2000);
    assert.deepEqual(test.dispatched, ["portfolio-loader-exit"]);
  }],
  ["reduced motion uses the static header mark", async () => {
    const test = scenario({ introFinished: false, reducedMotion: true });
    test.video.dataset.preloadState = "disabled";
    test.changed();
    await test.advance(1000);
    test.assertRevealed("Reduced motion must not wait through the supplied film.");
    assert.equal(test.mark.style.left, "32px");
    assert.equal(test.mark.style.top, "22px");
    assert.equal(test.mark.style.transform, "none");
  }],
  ["seen intro is removed without replaying or emitting a second entrance", async () => {
    const test = scenario({ seen: true, introFinished: false });
    await test.advance(3000);
    assert.equal(test.loader.removed, true);
    assert.deepEqual(test.dispatched, []);
    assert.equal(test.classes.contains("portfolio-loading"), false);
  }],
  ["text-first case reveals after its content mounts", async () => {
    const test = scenario({ page: "project" });
    test.project.loading = false;
    test.project.textReady = true;
    test.changed();
    await test.advance(3000);
    test.assertRevealed("A mounted text-first case must reveal without waiting for an eager image or the eight-second timeout.");
  }],
  ["text readiness cannot bypass case Suspense", async () => {
    const test = scenario({ page: "project" });
    test.project.textReady = true;
    test.changed();
    await test.advance(3000);
    test.assertWaiting("A lazy fallback must remain blocked until the real case mounts.");
  }],
  ["text-first case still waits for fonts", async () => {
    const fonts = deferred();
    const test = scenario({ page: "project", fonts: fonts.promise });
    test.project.loading = false;
    test.project.textReady = true;
    test.changed();
    await test.advance(3000);
    test.assertWaiting("Text readiness must not bypass font readiness.");
    fonts.resolve();
    await test.advance(1800);
    test.assertRevealed("A text-first case must reveal after its fonts become ready.");
  }],
  ["pending video cannot be mistaken for disabled motion", async () => {
    const test = scenario();
    test.video.readyState = 2;
    await test.advance(3000);
    test.assertWaiting("Hero must decide its preload policy before the loader reveals it.");
  }],
  ["loading video waits for its first frame", async () => {
    const test = scenario();
    test.video.dataset.preloadState = "loading";
    test.video.readyState = 1;
    await test.advance(3000);
    test.assertWaiting("Metadata alone must not finish video preloading.");
  }],
  ["first video frame releases the loader", async () => {
    const test = scenario();
    test.video.dataset.preloadState = "loading";
    await test.advance(3000);
    test.video.readyState = 2;
    test.resourceEvent("loadeddata");
    await test.advance(1800);
    test.assertRevealed("A decoded poster and available first frame must reveal the homepage.");
  }],
  ...["disabled", "error"].map(state => [`${state} video uses the poster`, async () => {
    const test = scenario();
    test.video.dataset.preloadState = state;
    test.changed();
    await test.advance(3000);
    test.assertRevealed(`${state} motion must not prevent a decoded poster from appearing.`);
  }]),
  ["below-fold capability does not delay ready first-screen media", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(3000);
    test.assertRevealed("Ready Hero media must not wait for the capability renderer below the projects.");
  }],
  ["capability readiness cannot shorten an unfinished intro", async () => {
    const test = scenario({ capabilityState: "loading", introFinished: false });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(3000);
    test.capability.dataset.renderer = "ready";
    test.changed("data-renderer");
    await test.advance(1800);
    test.assertWaiting("The below-fold renderer completing must not bypass the intro movie.");
    test.introVideo.ended = true;
    test.introVideo.emit("ended");
    await test.advance(1000);
    test.assertRevealed("Ending the intro must reveal ready Hero content without a second renderer wait.");
  }],
  ["unavailable capability renderer does not block the homepage", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "disabled";
    await test.advance(3000);
    test.capability.dataset.renderer = "unavailable";
    test.changed("data-renderer");
    await test.advance(1800);
    test.assertRevealed("A reported renderer failure must allow the homepage and its fallback to appear.");
  }],
  ["project Suspense waits for case content", async () => {
    const test = scenario({ page: "project" });
    await test.advance(3000);
    test.assertWaiting("An initially empty lazy case must not count as loaded content.");
  }],
  ["project eager image must load and decode", async () => {
    const decode = deferred();
    const test = scenario({ page: "project", decode: () => decode.promise });
    await test.advance(1500);
    test.project.loading = false;
    test.project.image = { ...test.image, complete: false };
    test.changed();
    await test.advance(1000);
    test.assertWaiting("Mounting an eager image must not count as loading it.");
    test.project.image.complete = true;
    test.resourceEvent("load");
    await test.advance(1000);
    test.assertWaiting("The project image must also finish decoding.");
    decode.resolve();
    await test.advance(1800);
    test.assertRevealed("A loaded and decoded first eager image must reveal the project.");
  }],
  ["project without a capability renderer can reveal", async () => {
    const test = scenario({ page: "project" });
    assert.equal(test.capability, null, "Project fixtures must not contain a homepage capability renderer.");
    test.project.loading = false;
    test.project.image = test.image;
    test.changed();
    await test.advance(3000);
    test.assertRevealed("A ready project page must not wait for the homepage capability renderer.");
  }],
  ["stalled offscreen renderer does not invoke the eight-second fallback", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(1800);
    test.assertRevealed("A stalled offscreen renderer must not extend the entry animation.");
  }],
  ["eight-second timeout releases stalled content", async () => {
    const test = scenario();
    await test.advance(7900);
    test.assertWaiting("The existing timeout must not fire before eight seconds.");
    await test.advance(2100);
    test.assertRevealed("The eight-second fallback must reveal content after the exit animation.");
  }],
  ["homepage poster must finish decoding", async () => {
    const decode = deferred();
    const test = scenario({ decode: () => decode.promise });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(3000);
    test.assertWaiting("Video readiness must not bypass poster decoding.");
    decode.resolve();
    await test.advance(1800);
    test.assertRevealed("Decoding the poster must complete an otherwise ready homepage.");
  }],
  ["critical fonts must be ready", async () => {
    const fonts = deferred();
    const test = scenario({ fonts: fonts.promise });
    test.video.dataset.preloadState = "disabled";
    await test.advance(3000);
    test.assertWaiting("A ready poster must not bypass critical font readiness.");
    fonts.resolve();
    await test.advance(1800);
    test.assertRevealed("Font readiness must complete an otherwise ready homepage.");
  }],
];

for (const [name, check] of checks) {
  await check();
  console.log(`PASS ${name}`);
}
console.log(`Loading verification passed (${checks.length} checks against the actual inline loader).`);
