import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

// Exercise the shipped inline loader, including its reveal animation, without
// depending on a browser or waiting eight real seconds for the timeout case.
const html = await readFile(new URL("../github-pages/index.html", import.meta.url), "utf8");
const loaderScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .filter(source => source.includes("const waitForCriticalContent"));
assert.equal(loaderScripts.length, 1, "Expected exactly one actual inline loader script.");
const loaderSource = loaderScripts[0];

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
  return {
    classList: classList(),
    hidden: false,
    textContent: "",
    removed: false,
    remove() { this.removed = true; },
  };
}

function scenario({ page = "hero", decode, fonts, capabilityState = "ready" } = {}) {
  let now = 0;
  let nextId = 0;
  const jobs = [];
  const observers = new Set();
  const resourceListeners = new Map();
  const dispatched = [];
  const loader = element();
  const value = element();
  const progress = element();
  const welcome = element();
  const documentClasses = classList();
  documentClasses.add("portfolio-loading");

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
    "portfolio-boot-value": value,
    "portfolio-boot-progress": progress,
    "portfolio-boot-welcome": welcome,
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
      fonts: { ready: fonts ?? Promise.resolve() },
      getElementById: id => nodes[id] ?? null,
    },
    performance: { now: () => now },
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: callback => schedule(() => callback(now), 16),
    cancelAnimationFrame: cancel,
    setTimeout: (callback, delay) => schedule(callback, delay),
    clearTimeout: cancel,
    sessionStorage: { setItem() {} },
    Event: class { constructor(type) { this.type = type; } },
    dispatchEvent(event) {
      assert.equal(loader.removed, true, "The hero reveal signal must wait until the loader has left.");
      assert.equal(documentClasses.contains("portfolio-loading"), false, "The hero reveal signal must follow page unlock.");
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
  ["homepage waits for the first capability frame", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(3000);
    test.assertWaiting("Ready Hero media must not reveal the homepage before its first capability frame.");
  }],
  ["first capability frame releases the loader", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(3000);
    test.capability.dataset.renderer = "ready";
    test.changed("data-renderer");
    await test.advance(1800);
    test.assertRevealed("The first rendered capability frame must reveal an otherwise ready homepage.");
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
  ["eight-second timeout releases a stalled capability renderer", async () => {
    const test = scenario({ capabilityState: "loading" });
    test.video.dataset.preloadState = "ready";
    test.video.readyState = 2;
    await test.advance(7900);
    test.assertWaiting("A stalled capability renderer must not trigger the fallback before eight seconds.");
    await test.advance(2100);
    test.assertRevealed("The eight-second fallback must release the homepage when model loading stalls.");
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
