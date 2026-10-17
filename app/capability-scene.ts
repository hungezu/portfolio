import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type CapabilityBox = {
  x: number;
  y: number;
  z?: number;
  width: number;
  height: number;
  depth: number;
  dark?: boolean;
  material?: "porcelain" | "graphite" | "metal" | "glass";
  label?: string;
  graphic?: "type" | "states" | "components" | "grid" | "lines" | "lens" | "prototype" | "trend" | "dots";
  hover?: number;
};

export type CapabilitySceneSpec = {
  boxes: CapabilityBox[];
  grid?: boolean;
  ring?: boolean;
  horizontalFocus?: { x: number; z: number };
  reducedMotion?: boolean;
};

type ProjectedBounds = { left: number; right: number; bottom: number; top: number };
type SceneFraming = {
  envelope: ProjectedBounds;
  subject: ProjectedBounds;
  centerX: number;
  centerY: number;
  visualSize: number;
};
const framingCache = new WeakMap<CapabilityBox[], Map<number, SceneFraming>>();

/** Measure sculpture and shadow separately so the six subjects share one visual scale. */
function measureFraming(spec: CapabilitySceneSpec, motionScale: number, inverse: THREE.Matrix4, lightDirection: THREE.Vector3): SceneFraming {
  const cached = framingCache.get(spec.boxes)?.get(motionScale);
  if (cached) return cached;
  const empty = (): ProjectedBounds => ({ left: Infinity, right: -Infinity, bottom: Infinity, top: -Infinity });
  const envelope = empty();
  const subject = empty();
  const include = (point: THREE.Vector3, isSubject = false) => {
    const projected = point.clone().applyMatrix4(inverse);
    for (const bounds of isSubject ? [envelope, subject] : [envelope]) {
      bounds.left = Math.min(bounds.left, projected.x);
      bounds.right = Math.max(bounds.right, projected.x);
      bounds.bottom = Math.min(bounds.bottom, projected.y);
      bounds.top = Math.max(bounds.top, projected.y);
    }
  };
  spec.boxes.forEach(box => {
    if (box.y - box.height / 2 < 8) {
      [-1, 1].forEach(x => [-1, 1].forEach(z => {
        include(new THREE.Vector3(box.x + x * box.width * 1.3 / 2, -0.75, (box.z || 0) + z * (box.depth * 1.65 + 12) / 2));
      }));
    }
    for (const yaw of [-0.036, 0, 0.036]) {
      for (const pitch of [-0.009, 0, 0.009]) {
        const rotation = new THREE.Euler(pitch * motionScale, yaw * motionScale, 0);
        for (const lift of [0, (box.hover ?? 0) * motionScale]) {
          [-1, 1].forEach(x => [-1, 1].forEach(y => [-1, 1].forEach(z => {
            const point = new THREE.Vector3(box.x + x * box.width / 2, box.y + y * box.height / 2 + lift, (box.z || 0) + z * box.depth / 2).applyEuler(rotation);
            include(point, true);
            if (box.material === "glass") return;
            const travel = Math.max(0, (-1 - point.y) / lightDirection.y);
            const cast = point.clone().addScaledVector(lightDirection, travel);
            [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
              include(new THREE.Vector3(cast.x + sx * 22, -1, cast.z + sz * 22));
            }));
          })));
        }
      }
    }
  });
  const result: SceneFraming = {
    envelope, subject,
    centerX: spec.horizontalFocus
      ? new THREE.Vector3(spec.horizontalFocus.x, 0, spec.horizontalFocus.z).applyMatrix4(inverse).x
      : (subject.left + subject.right) / 2,
    centerY: (subject.top + subject.bottom) / 2,
    visualSize: Math.sqrt((subject.right - subject.left) * (subject.top - subject.bottom)),
  };
  const variants = framingCache.get(spec.boxes) ?? new Map<number, SceneFraming>();
  variants.set(motionScale, result);
  framingCache.set(spec.boxes, variants);
  return result;
}

const typeface = '"Helvetica Neue", "PingFang SC", "Microsoft YaHei", Arial, sans-serif';

/** All face artwork is drawn locally: it remains sharp at any canvas size and makes no asset requests. */
function faceTexture(box: CapabilityBox): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const density = 4;
  canvas.width = Math.ceil(box.width * density);
  canvas.height = Math.ceil(box.height * density);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Capability face drawing is unavailable");
  ctx.scale(density, density);
  const w = box.width;
  const h = box.height;
  const ink = box.dark ? "#f6f6f6" : "#171717";
  const fine = box.dark ? "rgba(255,255,255,.38)" : "rgba(35,35,35,.28)";
  const faint = box.dark ? "rgba(255,255,255,.13)" : "rgba(35,35,35,.10)";
  const pad = Math.min(13, w * 0.13);
  const fontSize = Math.min(18, w * 0.33, h * 0.34);
  ctx.fillStyle = ink;
  ctx.textBaseline = "top";
  ctx.font = `600 ${fontSize}px ${typeface}`;
  if (box.label && w < 50 && h > 80) {
    ctx.font = `500 14px ${typeface}`;
    [...box.label].forEach((letter, index) => ctx.fillText(letter, (w - 14) / 2, 17 + index * 17));
  } else if (box.label) ctx.fillText(box.label, pad, Math.min(17, h * 0.19));
  ctx.strokeStyle = fine;
  ctx.lineWidth = 0.65;
  ctx.lineCap = "round";
  const line = (x1: number, y1: number, x2: number, y2: number, color = fine) => {
    ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const round = (x: number, y: number, width: number, height: number, radius: number, fill?: string) => {
    ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    else { ctx.strokeStyle = fine; ctx.stroke(); }
  };
  const circle = (x: number, y: number, radius: number, fill?: string) => {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    else { ctx.strokeStyle = fine; ctx.stroke(); }
  };
  const top = Math.max(43, h * 0.3);
  const bottom = h - 15;
  const contentWidth = w - pad * 2;
  const contentHeight = Math.max(10, bottom - top);

  switch (box.graphic) {
    case "type": {
      for (let y = top; y < bottom; y += 13) line(pad, y, w - pad, y, faint);
      line(w * 0.30, top - 5, w * 0.30, bottom + 2, faint);
      line(w * 0.50, top - 5, w * 0.50, bottom + 2, faint);
      ctx.font = `500 ${Math.min(w * 0.44, contentHeight * 0.58)}px ${typeface}`;
      ctx.fillStyle = ink; ctx.textBaseline = "middle";
      ctx.fillText("Aa", w * 0.29, top + contentHeight * 0.52);
      break;
    }
    case "states": {
      const y = top + 7;
      round(pad, y, contentWidth * 0.43, 15, 7.5, ink);
      circle(w * 0.65, y + 7.5, 7.5);
      circle(w * 0.84, y + 7.5, 7.5, faint);
      round(pad, y + 27, contentWidth * 0.6, 14, 7, "rgba(50,50,50,.16)");
      round(pad, y + 53, contentWidth * 0.85, 16, 8);
      break;
    }
    case "components": {
      const y = top + 4;
      circle(pad + 10, y + 10, 10, ink);
      circle(pad + 40, y + 10, 10);
      round(w - pad - 22, y, 22, 22, 1.5);
      round(pad, y + 35, contentWidth, 18, 6);
      round(pad, y + 65, 35, 17, 8.5, ink);
      circle(pad + 26, y + 73.5, 6.7, "#f8f8f8");
      [0, 1, 2].forEach(i => circle(w - pad - 30 + i * 12, y + 74, 2, fine));
      break;
    }
    case "grid": {
      const column = contentWidth / 5;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? "rgba(30,30,30,.075)" : "rgba(30,30,30,.13)";
        ctx.fillRect(pad + i * column, top, column * 0.64, contentHeight);
      }
      line(pad, top, w - pad, top, fine);
      line(pad, top + contentHeight * 0.5, w - pad, top + contentHeight * 0.5, fine);
      line(pad, bottom, w - pad, bottom, fine);
      break;
    }
    case "lines": {
      const count = h < 90 ? 2 : 3;
      for (let i = 0; i < count; i++) {
        const y = top + i * Math.min(13, contentHeight / count);
        line(pad, y, pad + contentWidth * (i === count - 1 ? 0.55 : 0.88), y);
      }
      break;
    }
    case "lens": {
      const radius = Math.min(w * 0.24, contentHeight * 0.29);
      const centerY = top + contentHeight * 0.43;
      circle(w * 0.5, centerY, radius);
      circle(w * 0.5, centerY, radius * 0.6);
      circle(w * 0.5, centerY, 2, ink);
      line(w * 0.5 - radius - 6, centerY, w * 0.5 - radius + 3, centerY);
      line(w * 0.5 + radius - 3, centerY, w * 0.5 + radius + 6, centerY);
      line(w * 0.5, centerY - radius - 6, w * 0.5, centerY - radius + 3);
      line(w * 0.5, centerY + radius - 3, w * 0.5, centerY + radius + 6);
      break;
    }
    case "prototype": {
      round(pad, top, contentWidth, contentHeight, 2);
      line(pad, top + 12, w - pad, top + 12);
      circle(pad + 5, top + 6, 1, fine);
      round(pad + 7, top + 21, contentWidth * 0.33, Math.max(8, contentHeight - 29), 1, faint);
      line(pad + contentWidth * 0.51, top + 24, w - pad - 8, top + 24);
      line(pad + contentWidth * 0.51, top + 33, w - pad - 16, top + 33);
      break;
    }
    case "trend": {
      for (let i = 0; i < 4; i++) line(pad, top + i * contentHeight / 3, w - pad, top + i * contentHeight / 3, faint);
      ctx.strokeStyle = ink; ctx.lineWidth = 1.65;
      ctx.beginPath();
      ctx.moveTo(pad, bottom - 8);
      ctx.bezierCurveTo(w * 0.26, bottom - 8, w * 0.22, top + contentHeight * 0.52, w * 0.43, top + contentHeight * 0.58);
      ctx.bezierCurveTo(w * 0.64, top + contentHeight * 0.65, w * 0.68, top + contentHeight * 0.15, w - pad - 5, top + 8);
      ctx.stroke();
      circle(w - pad - 5, top + 8, 3, ink);
      break;
    }
    case "dots": {
      const count = h < 90 ? 3 : 5;
      for (let i = 0; i < count; i++) circle(pad + 4 + i * Math.min(15, contentWidth / count), top + 6, i === 0 ? 4 : 2.6, i === 0 ? ink : fine);
      if (h > 90) line(pad, top + 27, w - pad, top + 27, faint);
      break;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function contactTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Capability shadow drawing is unavailable");
  const gradient = ctx.createRadialGradient(64, 64, 12, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,.65)");
  gradient.addColorStop(0.38, "rgba(0,0,0,.36)");
  gradient.addColorStop(0.72, "rgba(0,0,0,.11)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/** Subtle surface variation, generated once without loading a texture asset. */
function surfaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Capability surface drawing is unavailable");
  const pixels = ctx.createImageData(128, 128);
  let seed = 173;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const value = 220 + (seed >>> 27);
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 4;
  return texture;
}

/** A sparse, fading drafting surface on the actual ground plane. */
function groundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Capability ground drawing is unavailable");
  for (let y = 16; y < 512; y += 24) {
    for (let x = 16; x < 512; x += 24) {
      const distance = Math.hypot((x - 256) / 248, (y - 256) / 248);
      const alpha = Math.max(0, 1 - distance) * 0.4;
      ctx.fillStyle = `rgba(40,40,40,${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function disposeObject(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse(object => {
    const renderable = object as THREE.Mesh;
    if (renderable.geometry) geometries.add(renderable.geometry);
    if (renderable.material) {
      const list = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
      list.forEach(material => materials.add(material));
    }
  });
  materials.forEach(material => {
    Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
    material.dispose();
  });
  textures.forEach(texture => texture.dispose());
  geometries.forEach(geometry => geometry.dispose());
}

export type CapabilitySceneHandle = {
  ready: Promise<void>;
  setSpec(spec: CapabilitySceneSpec): void;
  dispose(): void;
};

/** One context and prebuilt family: tab changes only swap the visible sculpture. */
export function createCapabilityScene(host: HTMLDivElement, spec: CapabilitySceneSpec, family: readonly CapabilitySceneSpec[] = [spec]): CapabilitySceneHandle {
  // A settled on-demand frame must survive compositing and scrolling into view.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.pointerEvents = "none";
  host.appendChild(renderer.domElement);
  host.dataset.sceneState = "idle";
  host.dataset.sceneRenderCount = "0";

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-350, 350, 150, -150, 1, 2400);
  const cameraDirection = new THREE.Vector3(420, 340, 700).normalize();
  const cameraTarget = new THREE.Vector3(0, 85, 0);
  camera.position.copy(cameraTarget).addScaledVector(cameraDirection, 1100);
  camera.lookAt(cameraTarget);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.03);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.48;
  disposeObject(room);
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b0b0, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(-220, 900, 320);
  key.target.position.set(0, 75, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -480;
  key.shadow.camera.right = 480;
  key.shadow.camera.top = 390;
  key.shadow.camera.bottom = -270;
  key.shadow.camera.near = 20;
  key.shadow.camera.far = 1200;
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.65;
  key.shadow.radius = 26;
  key.shadow.blurSamples = 20;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.25);
  fill.position.set(420, 230, -200);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.95);
  rim.position.set(260, 380, -420);
  scene.add(rim);

  const surface = surfaceTexture();
  const white = new THREE.MeshPhysicalMaterial({
    color: 0xefefef, roughness: 0.46, metalness: 0.025,
    clearcoat: 0.28, clearcoatRoughness: 0.28, envMapIntensity: 0.78,
    roughnessMap: surface, bumpMap: surface, bumpScale: 0.12,
  });
  const charcoal = new THREE.MeshPhysicalMaterial({
    color: 0x171717, roughness: 0.30, metalness: 0.18,
    clearcoat: 0.38, clearcoatRoughness: 0.22, envMapIntensity: 1,
    roughnessMap: surface, bumpMap: surface, bumpScale: 0.07,
  });
  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xbcbcbc, roughness: 0.28, metalness: 0.82,
    clearcoat: 0.2, clearcoatRoughness: 0.26, envMapIntensity: 1.15,
    roughnessMap: surface, bumpMap: surface, bumpScale: 0.045,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeee, roughness: 0.23, metalness: 0.08,
    clearcoat: 0.7, clearcoatRoughness: 0.18, envMapIntensity: 0.95,
    transparent: true, opacity: 0.38, depthWrite: false,
  });
  const materials = { porcelain: white, graphite: charcoal, metal, glass };
  const ambientShadow = contactTexture();
  const usedMaterials = new Set<THREE.Material>();
  type Assembly = {
    root: THREE.Group;
    model: THREE.Group;
    moving: Array<{ object: THREE.Group; baseY: number; amount: number }>;
  };
  const createAssembly = (spec: CapabilitySceneSpec): Assembly => {
    const root = new THREE.Group();
    const model = new THREE.Group();
    root.add(model);
    scene.add(root);
    const xMin = Math.min(...spec.boxes.map(box => box.x - box.width / 2));
    const xMax = Math.max(...spec.boxes.map(box => box.x + box.width / 2));
    const zMin = Math.min(...spec.boxes.map(box => (box.z || 0) - box.depth / 2));
    const zMax = Math.max(...spec.boxes.map(box => (box.z || 0) + box.depth / 2));
    const groundWidth = xMax - xMin + 100;
    const groundDepth = zMax - zMin + 140;
    const groundCenterX = (xMin + xMax) / 2;
    const groundCenterZ = (zMin + zMax) / 2;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(groundWidth, groundDepth),
      new THREE.MeshBasicMaterial({ map: groundTexture(), transparent: true, depthWrite: false, toneMapped: false }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(groundCenterX, -1.2, groundCenterZ);
    root.add(ground);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1800),
      new THREE.ShadowMaterial({ color: 0x151515, opacity: 0.085, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1;
    shadow.receiveShadow = true;
    root.add(shadow);
    const moving: Assembly["moving"] = [];

    spec.boxes.forEach(box => {
      const group = new THREE.Group();
      group.position.set(box.x, box.y, box.z || 0);
      const bevel = Math.min(2.6, box.depth * 0.09, box.height * 0.09);
      const material = materials[box.material ?? (box.dark ? "graphite" : "porcelain")];
      usedMaterials.add(material);
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(box.width, box.height, box.depth, 5, bevel),
        material,
      );
      mesh.castShadow = box.material !== "glass";
      mesh.receiveShadow = true;
      group.add(mesh);
      if (box.label || box.graphic) {
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(box.width - 0.8, box.height - 0.8),
          new THREE.MeshBasicMaterial({
            map: faceTexture(box), transparent: true, depthWrite: false,
            toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1,
          }),
        );
        face.position.z = box.depth / 2 + 0.07;
        group.add(face);
      }
      model.add(group);
      if (box.hover) moving.push({ object: group, baseY: box.y, amount: box.hover });
      if (box.y - box.height / 2 < 8) {
        const contactWidth = box.width * 1.3;
        const contactDepth = box.depth * 1.65 + 12;
        const contact = new THREE.Mesh(
          new THREE.PlaneGeometry(contactWidth, contactDepth),
          new THREE.MeshBasicMaterial({ map: ambientShadow, transparent: true, opacity: 0.24, depthWrite: false, toneMapped: false }),
        );
        contact.rotation.x = -Math.PI / 2;
        contact.position.set(box.x, -0.75, box.z || 0);
        root.add(contact);
        const contactEdge = new THREE.Mesh(
          new THREE.PlaneGeometry(box.width * 1.08, box.depth * 0.7 + 6),
          new THREE.MeshBasicMaterial({ map: ambientShadow, transparent: true, opacity: 0.34, depthWrite: false, toneMapped: false }),
        );
        contactEdge.rotation.x = -Math.PI / 2;
        contactEdge.position.set(box.x, -0.65, box.z || 0);
        root.add(contactEdge);
      }
    });

    if (spec.grid) {
      const positions: number[] = [];
      const front = zMax + 18;
      positions.push(xMin - 14, -0.5, front, xMax + 14, -0.5, front);
      spec.boxes.filter(box => box.label).forEach(box => {
        positions.push(box.x, -0.5, front - 5, box.x, -0.5, front + 5);
      });
      const grid = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)),
        new THREE.LineDashedMaterial({ color: 0x8c8c8c, transparent: true, opacity: 0.28, dashSize: 2, gapSize: 3, depthWrite: false }),
      );
      grid.computeLineDistances();
      model.add(grid);
    }
    if (spec.ring) {
      const curve = new THREE.EllipseCurve(groundCenterX, groundCenterZ, (xMax - xMin) / 2 + 14, (zMax - zMin) / 2 + 28, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(100).map(point => new THREE.Vector3(point.x, -0.5, point.y));
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineDashedMaterial({ color: 0x9f9f9f, transparent: true, opacity: 0.28, dashSize: 2, gapSize: 4 }),
      );
      ring.computeLineDistances();
      model.add(ring);
    }

    return { root, model, moving };
  };
  const familySpecs = [...family];
  if (!familySpecs.some(item => item.boxes === spec.boxes)) familySpecs.unshift(spec);
  const assemblies = new Map<CapabilityBox[], Assembly>();
  familySpecs.forEach(item => {
    if (!assemblies.has(item.boxes)) assemblies.set(item.boxes, createAssembly(item));
  });
  let activeSpec = spec;
  let activeAssembly = assemblies.get(spec.boxes)!;
  const selectAssembly = () => assemblies.forEach(assembly => { assembly.root.visible = assembly === activeAssembly; });
  selectAssembly();

  let disposed = false;
  let initialized = false;
  let contextLost = false;
  let visible = document.visibilityState !== "hidden";
  let inViewport = true;
  let frame = 0;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentLift = 0;
  let targetLift = 0;
  let lastTime = 0;
  let renderCount = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let preparationGeneration = 0;
  let pendingCompilation: Promise<unknown> | null = null;
  let resolveReady!: () => void;
  let rejectReady!: (reason: unknown) => void;
  const ready = new Promise<void>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  // Cached framing includes the complete hover, cast-shadow and contact envelope.
  camera.updateMatrixWorld();
  const lightDirection = key.target.position.clone().sub(key.position);

  const renderFrame = (time: number, force = false) => {
    frame = 0;
    if (disposed || !initialized || contextLost || (!force && !visible)) return;
    const step = lastTime ? Math.min(48, time - lastTime) : 16;
    lastTime = time;
    const smooth = 1 - Math.exp(-step / 105);
    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;
    currentLift += (targetLift - currentLift) * smooth;
    const motionScale = activeSpec.reducedMotion ? 0.5 : 1;
    activeAssembly.model.rotation.set(currentY * 0.009 * motionScale, currentX * 0.036 * motionScale, 0);
    activeAssembly.moving.forEach(item => { item.object.position.y = item.baseY + currentLift * item.amount * motionScale; });
    renderer.render(scene, camera);
    host.dataset.sceneRenderCount = String(++renderCount);
    const settling = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) + Math.abs(targetLift - currentLift);
    if (visible && settling > 0.0015) {
      host.dataset.sceneState = "settling";
      frame = requestAnimationFrame(renderFrame);
    } else {
      host.dataset.sceneState = targetLift ? "hover" : "idle";
      lastTime = 0;
    }
  };
  const requestRender = () => {
    if (!disposed && initialized && !contextLost && visible && !frame) frame = requestAnimationFrame(renderFrame);
  };
  const renderNow = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    // Preparation and tab swaps draw before the viewport observer fires.
    renderFrame(performance.now(), true);
  };
  const resize = (force = false) => {
    if (disposed || contextLost) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    // Setting canvas size clears its buffer, including an otherwise settled frame.
    if (width !== canvasWidth || height !== canvasHeight) {
      renderer.setSize(width, height, false);
      canvasWidth = width;
      canvasHeight = height;
    }
    const motionScale = activeSpec.reducedMotion ? 0.5 : 1;
    const framing = measureFraming(activeSpec, motionScale, camera.matrixWorldInverse, lightDirection);
    const familyFraming = familySpecs.map(item => measureFraming(item, motionScale, camera.matrixWorldInverse, lightDirection));
    const aspect = width / height;
    const sharedFrame = Math.max(...familyFraming.map(item => Math.max(
      item.envelope.top - item.centerY, item.centerY - item.envelope.bottom,
      (item.envelope.right - item.centerX) / aspect, (item.centerX - item.envelope.left) / aspect,
    ) / item.visualSize)) * 2 * 1.12;
    const frameHeight = sharedFrame * framing.visualSize;
    const { centerX, centerY } = framing;
    camera.left = centerX - frameHeight * aspect / 2;
    camera.right = centerX + frameHeight * aspect / 2;
    camera.top = centerY + frameHeight / 2;
    camera.bottom = centerY - frameHeight / 2;
    camera.updateProjectionMatrix();
    const inset = Math.min(
      (framing.envelope.left - camera.left) * width / (camera.right - camera.left),
      (camera.right - framing.envelope.right) * width / (camera.right - camera.left),
      (camera.top - framing.envelope.top) * height / frameHeight,
      (framing.envelope.bottom - camera.bottom) * height / frameHeight,
    );
    host.dataset.sceneSafeInset = inset.toFixed(1);
    host.dataset.sceneSubjectWidth = ((framing.subject.right - framing.subject.left) * height / frameHeight).toFixed(1);
    host.dataset.sceneSubjectHeight = ((framing.subject.top - framing.subject.bottom) * height / frameHeight).toFixed(1);
    if (force || visible) renderNow();
  };
  const pointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const rect = host.getBoundingClientRect();
    targetX = THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    targetY = THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    targetLift = 1;
    requestRender();
  };
  const pointerLeave = () => { targetX = 0; targetY = 0; targetLift = 0; requestRender(); };
  const updateVisibility = () => {
    visible = inViewport && document.visibilityState !== "hidden";
    if (visible) renderNow();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  };
  const prepare = () => {
    const generation = ++preparationGeneration;
    initialized = false;
    // compileAsync traverses synchronously, so compile all six before selecting.
    assemblies.forEach(assembly => { assembly.root.visible = true; });
    let compilation: Promise<unknown>;
    try { compilation = renderer.compileAsync(scene, camera); }
    catch (error) { selectAssembly(); rejectReady(error); return; }
    selectAssembly();
    pendingCompilation = compilation;
    compilation.then(() => {
      if (disposed || contextLost || generation !== preparationGeneration) return;
      initialized = true;
      resize(true);
      resolveReady();
    }).catch(error => {
      if (!disposed && !contextLost && generation === preparationGeneration) rejectReady(error);
    });
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    initialized = false;
    preparationGeneration++;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    host.dataset.sceneState = "context-lost";
  };
  const onContextRestored = () => {
    if (disposed) return;
    contextLost = false;
    canvasWidth = canvasHeight = 0;
    resize();
    prepare();
  };
  host.addEventListener("pointerenter", pointerMove);
  host.addEventListener("pointermove", pointerMove);
  host.addEventListener("pointerleave", pointerLeave);
  document.addEventListener("visibilitychange", updateVisibility);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(entries => {
    inViewport = Boolean(entries[0]?.isIntersecting);
    updateVisibility();
  }, { rootMargin: "50px" });
  intersectionObserver.observe(host);
  resize();
  prepare();

  return {
    ready,
    setSpec(nextSpec) {
      if (disposed) return;
      let assembly = assemblies.get(nextSpec.boxes);
      if (!assembly) {
        familySpecs.push(nextSpec);
        assembly = createAssembly(nextSpec);
        assemblies.set(nextSpec.boxes, assembly);
      }
      activeSpec = nextSpec;
      activeAssembly = assembly;
      selectAssembly();
      currentX = currentY = currentLift = targetX = targetY = targetLift = 0;
      lastTime = 0;
      // A tab change is an immediate draw, without a renderer restart or hover.
      resize(true);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      preparationGeneration++;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointerenter", pointerMove);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", updateVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      renderer.domElement.remove();
      resolveReady();
      const release = () => {
        disposeObject(scene);
        Object.values(materials).forEach(material => { if (!usedMaterials.has(material)) material.dispose(); });
        environment.dispose();
        key.shadow.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
      // Three polls its programs during compileAsync; release after polling ends.
      if (pendingCompilation) pendingCompilation.then(release, release);
      else release();
      delete host.dataset.sceneState;
      delete host.dataset.sceneRenderCount;
      delete host.dataset.sceneSafeInset;
      delete host.dataset.sceneSubjectWidth;
      delete host.dataset.sceneSubjectHeight;
    },
  };
}
