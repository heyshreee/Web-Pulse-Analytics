import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapPin, RefreshCw, Loader2, Globe, Plus, Minus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared constants (v0 Studio Tokens)
// ---------------------------------------------------------------------------
const LIVE_EMERALD = 0x10b981;
const STUDIO_WHITE = 0xededed;
const STUDIO_GRID = 0x222222;
const STUDIO_SURFACE = 0x050505;
const STUDIO_SLATE = 0x525252;

// A visitor is considered "active" if they were seen within this window.
const ACTIVE_WINDOW = 10 * 60 * 1000; // 10 minutes

const GEOJSON_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

const toRad = (deg) => (deg * Math.PI) / 180;

// Project lat/lng (degrees) onto a unit sphere radius
function geoToVec3(lat, lng, radius = 1) {
  const phi = toRad(90 - lat);
  const theta = toRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Rounding factor used to cluster nearby geo points into a single node
const CLUSTER = 10000;

function clusterKey(d) {
  if (d.lat == null || d.lng == null) return null;
  return Math.round(d.lat * CLUSTER) + ':' + Math.round(d.lng * CLUSTER);
}

// Ray-casting point-in-polygon test on projected [lng, lat] coordinates
function pointInPolygon(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > point[1]) !== (yj > point[1]) &&
        point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Generate a dot-matrix of world landmass points from GeoJSON by sampling a
// lat/lng grid and testing each sample inside any country polygon.
// Uses uniform spherical surface sampling (scaled by 1/cos(lat)) so dot
// density is consistent globally and doesn't cluster at the poles.
function generateLandDots(features, stepDeg = 2) {
  const polygons = [];
  (features || []).forEach((f) => {
    const geom = f?.geometry;
    if (!geom) return;
    if (geom.type === 'Polygon') {
      geom.coordinates.forEach((ring) => polygons.push(ring));
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((poly) => poly.forEach((ring) => polygons.push(ring)));
    }
  });
  if (!polygons.length) return [];

  const dots = [];
  for (let lat = -88; lat <= 88; lat += stepDeg) {
    const cosLat = Math.cos(toRad(lat));
    const lngStep = cosLat > 0.001 ? Math.max(stepDeg, stepDeg / cosLat) : 360;
    for (let lng = -180; lng <= 180; lng += lngStep) {
      const point = [lng, lat];
      for (let i = 0; i < polygons.length; i++) {
        if (pointInPolygon(point, polygons[i])) {
          dots.push(geoToVec3(lat, lng, 1.002));
          break;
        }
      }
    }
  }
  return dots;
}

// ---------------------------------------------------------------------------
// Helpers to build Three.js primitives
// ---------------------------------------------------------------------------
function createLatLngGrid(radius = 1, segments = 24) {
  const points = [];
  const step = 360 / segments;
  for (let i = 0; i < segments; i++) {
    const lng = i * step;
    const a = new THREE.Vector3(); const b = new THREE.Vector3();
    for (let lat = -90; lat <= 90; lat += 180 / (segments / 2)) {
      const pol = (Math.PI / 2) - toRad(lat);
      const te = toRad(lng);
      a.set(
        -radius * Math.sin(pol) * Math.cos(te),
        radius * Math.cos(pol),
        radius * Math.sin(pol) * Math.sin(te)
      );
      if (lat > -90) points.push(b.clone(), a.clone());
      b.copy(a);
    }
  }
  for (let j = 1; j < segments / 2; j++) {
    const lat = j * step - 90;
    const pol = Math.PI / 2 - toRad(lat);
    const pointsRow = [];
    for (let i = 0; i < segments; i++) {
      const te = toRad(i * step);
      pointsRow.push(new THREE.Vector3(
        -radius * Math.sin(pol) * Math.cos(te),
        radius * Math.cos(pol),
        radius * Math.sin(pol) * Math.sin(te)
      ));
    }
    for (let i = 0; i < segments; i++) {
      points.push(pointsRow[i].clone(), pointsRow[(i + 1) % segments].clone());
    }
  }
  return points;
}

function createGlowTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  const c = new THREE.Color(color);
  g.addColorStop(0, `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},1)`);
  g.addColorStop(0.4, `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},0.35)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const NetworkGlobe = ({
  activityData = [],
  loading = false,
  error = false,
  onRetry,
  onSelectLocation,
  realTimeVisitors = 0,
  isDark = true,
}) => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const stateRef = useRef({});
  const [dotsReady, setDotsReady] = useState(false);

  // Compact tooltip read from renderer raycast
  const [tooltip, setTooltip] = useState(null);

  // Whether we're running on a constrained device
  const isLowPower = useMemo(
    () => window.matchMedia?.('(max-width: 768px), (prefers-reduced-motion: reduce)').matches,
    []
  );

  // -------------------------------------------------------------------------
  // Data preparation: cluster live activity into nodes + connections
  // -------------------------------------------------------------------------
  const prepared = useMemo(() => {
    // Only consider currently-active visitors. Items without a usable timestamp
    // are treated as fresh (they arrive via the live socket), so keep them.
    const now = Date.now();
    const valid = (activityData || [])
      .filter((d) => d.lat != null && d.lng != null)
      .filter((d) => {
        if (!d.timestamp) return true;
        const t = new Date(d.timestamp).getTime();
        if (isNaN(t)) return true;
        return now - t <= ACTIVE_WINDOW;
      });

    const clusters = new Map();
    valid.forEach((d) => {
      const key = clusterKey(d);
      if (!key) return;
      if (!clusters.has(key)) {
        clusters.set(key, {
          ...d,
          lat: Math.round(d.lat * CLUSTER) / CLUSTER,
          lng: Math.round(d.lng * CLUSTER) / CLUSTER,
          count: 0,
          ids: [],
        });
      }
      const c = clusters.get(key);
      c.count += 1;
      c.ids.push(d.id);
      // Prefer most recent / non-empty location display
      if (!d.location || d.location === 'Unknown Location') {
        c.location = d.location || c.location;
      } else if (!c.location || c.location === 'Unknown Location') {
        c.location = d.location;
      }
    });

    const nodes = Array.from(clusters.values());
    // Sort by count desc so the busiest nodes render on top.
    nodes.sort((a, b) => b.count - a.count);

    // Meaningful connections between the busiest nodes (star pattern from top node)
    const top = nodes.slice(0, 4);
    const arcs = [];
    if (top.length >= 2) {
      const hub = top[0];
      for (let i = 1; i < top.length; i++) {
        arcs.push({ from: hub, to: top[i], value: hub.count + top[i].count });
      }
      // A couple of peripheral connections for network texture (capped)
      if (nodes.length >= 4) {
        arcs.push({ from: top[1], to: nodes[3], value: top[1].count + nodes[3].count });
      }
    }
    return { nodes, arcs };
  }, [activityData]);

  const hasData = prepared.nodes.length > 0;

  // -------------------------------------------------------------------------
  // Scene bootstrap
  // -------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: !isLowPower, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPower ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.4, 4.6);

    // Ambient + subtle directional to keep the transparent sphere readable
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.1;
    controls.maxDistance = 8;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enablePan = false;
    // Allow drag-to-rotate. Auto-rotate pauses while dragging (see handlers
    // below). Zoom is controlled by the on-screen buttons.
    controls.enableRotate = true;
    controls.enableZoom = false;
    // Remove any remaining zoom gesture bindings (middle-click / two-finger).
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.ROTATE };
    // Block wheel/trackpad scrolling & any dolly over the globe entirely.
    const blockWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    renderer.domElement.addEventListener('wheel', blockWheel, { passive: false });

    let rotateResumeTimer = null;
    const pauseRotate = () => {
      controls.autoRotate = false;
      clearTimeout(rotateResumeTimer);
    };
    const resumeRotate = () => {
      rotateResumeTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2500);
    };
    controls.addEventListener('start', pauseRotate);
    controls.addEventListener('end', resumeRotate);

    // --- Grid lines + transparent globe surface ---
    const gridMat = new THREE.LineBasicMaterial({
      color: isDark ? STUDIO_GRID : 0xe5e5e5,
      transparent: true,
      opacity: isDark ? 0.35 : 0.5,
    });
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(createLatLngGrid(1, isLowPower ? 16 : 24)),
      gridMat
    );
    grid.renderOrder = 2;
    sceneGroup.add(grid);

    const surfaceMat = new THREE.MeshPhongMaterial({
      color: isDark ? STUDIO_SURFACE : 0xfcfcfc,
      transparent: true,
      opacity: isDark ? 0.65 : 0.25,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(1, isLowPower ? 32 : 48, isLowPower ? 32 : 48),
      surfaceMat
    );
    surface.renderOrder = 1;
    sceneGroup.add(surface);

    // --- Atmosphere halo (subtle monochrome) ---
    const haloMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0x000000,
      transparent: true,
      opacity: isDark ? 0.03 : 0.02,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.32, 48, 48), haloMat);
    sceneGroup.add(halo);

    // --- Stars (background particles, minimal) ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = isLowPower ? 160 : 380;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // Place on a surrounding sphere
      const v = new THREE.Vector3()
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(4 + Math.random() * 2.5);
      starPos[i * 3] = v.x; starPos[i * 3 + 1] = v.y; starPos[i * 3 + 2] = v.z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x555555, size: 0.018, transparent: true, opacity: 0.35, depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    // --- Dot-matrix continents (instanced) ---
    const MAX_LAND_DOTS = 8192;
    const dotGeo = new THREE.SphereGeometry(0.008, 5, 5);
    const dotMat = new THREE.MeshBasicMaterial({
      color: isDark ? STUDIO_WHITE : STUDIO_SLATE,
      transparent: true,
      opacity: isDark ? 0.65 : 0.5,
      depthWrite: false
    });
    const landDots = new THREE.InstancedMesh(dotGeo, dotMat, MAX_LAND_DOTS);
    landDots.frustumCulled = false;
    landDots.visible = false;
    landDots.renderOrder = 3;
    sceneGroup.add(landDots);
    const dotDummy = new THREE.Object3D();

    // --- Ambient floating particles near the globe ---
    const ambientCount = isLowPower ? 90 : 220;
    const ambientGeo = new THREE.BufferGeometry();
    const ambientPos = new Float32Array(ambientCount * 3);
    const ambientVel = new Float32Array(ambientCount);
    const ambientSeed = new Float32Array(ambientCount);
    for (let i = 0; i < ambientCount; i++) {
      const v = new THREE.Vector3().set(
        Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1
      ).normalize().multiplyScalar(1.25 + Math.random() * 0.7);
      ambientPos[i * 3] = v.x; ambientPos[i * 3 + 1] = v.y; ambientPos[i * 3 + 2] = v.z;
      ambientVel[i] = 0.1 + Math.random() * 0.4;
      ambientSeed[i] = Math.random() * Math.PI * 2;
    }
    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));
    const ambientMat = new THREE.PointsMaterial({
      color: 0x666666, size: 0.012, transparent: true, opacity: 0.35, depthWrite: false,
    });
    const ambientPts = new THREE.Points(ambientGeo, ambientMat);
    sceneGroup.add(ambientPts);

    // --- Nodes (instanced spheres + additive glow sprites) ---
    const nodeGeo = new THREE.SphereGeometry(1, 12, 12);
    const nodeMatInst = new THREE.MeshBasicMaterial({ color: LIVE_EMERALD, transparent: true, depthWrite: false });
    const nodesInst = new THREE.InstancedMesh(nodeGeo, nodeMatInst, 64);
    nodesInst.frustumCulled = false;
    sceneGroup.add(nodesInst);

    const glowTexture = createGlowTexture(LIVE_EMERALD);
    const nodeGlowMat = new THREE.SpriteMaterial({
      map: glowTexture, color: LIVE_EMERALD, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const glowSprites = [];
    const glowGroup = new THREE.Group();
    for (let i = 0; i < 64; i++) {
      const sp = new THREE.Sprite(nodeGlowMat);
      sp.visible = false;
      sp.scale.setScalar(0.001);
      glowGroup.add(sp);
      glowSprites.push(sp);
    }
    sceneGroup.add(glowGroup);

    // --- Arcs ---
    const arcs = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: LIVE_EMERALD, transparent: true, opacity: 0.45, depthWrite: false })
    );
    arcs.frustumCulled = false;
    sceneGroup.add(arcs);

    // Arc particles (points travelling along arcs)
    const arcCount = 48;
    const arcPartsPts = new THREE.BufferGeometry();
    const arcPartsPos = new Float32Array(arcCount * 3);
    arcPartsPts.setAttribute('position', new THREE.BufferAttribute(arcPartsPos, 3));
    const arcPartsMat = new THREE.PointsMaterial({
      color: 0x6ee7b7, size: 0.018, transparent: true, opacity: 0.9, depthWrite: false,
    });
    const arcParts = new THREE.Points(arcPartsPts, arcPartsMat);
    arcParts.visible = false;
    sceneGroup.add(arcParts);

    stateRef.current = {
      renderer, scene, sceneGroup, camera, controls,
      haloMat, landDots, dotDummy, dotGeo, dotMat,
      nodeGeo, nodeMatInst, nodesInst, nodeGlowMat, glowSprites,
      arcs, arcsGeo: arcs.geometry, arcParts, arcPartsPos, arcPartsPts,
      ambientPts, ambientPos, ambientVel, ambientSeed, stars, dir,
      gridMat, surface, surfaceMat, starMat,
      pauseRotate, resumeRotate, prepared: [], rebuild,
    };

    // -------------------------------------------------------------
    // Resize handling
    // -------------------------------------------------------------
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      rebuild();
    });
    ro.observe(container);

    // -------------------------------------------------------------
    // Fetch landmass dot matrix (once)
    // -------------------------------------------------------------
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error('geo fail');
        const gj = await res.json();
        if (cancelled) return;
        const dots = generateLandDots(gj?.features, isLowPower ? 2.5 : 2);
        rebuildLand(dots);
        setDotsReady(true);
      } catch {
        // silently fall back to grid-only globe
        setDotsReady(true);
      }
    })();

    function rebuildLand(dots) {
      const s = stateRef.current;
      if (!s) return;
      const count = Math.min(dots.length, MAX_LAND_DOTS);
      s.landDots.count = count;
      s.landDots.visible = count > 0;
      for (let i = 0; i < count; i++) {
        s.dotDummy.position.copy(dots[i]);
        s.dotDummy.scale.setScalar(isLowPower ? 1.6 : 1);
        s.dotDummy.updateMatrix();
        s.landDots.setMatrixAt(i, s.dotDummy.matrix);
      }
      s.landDots.instanceMatrix.needsUpdate = true;
    }

    // -------------------------------------------------------------
    // Rebuild nodes / arcs from props
    // -------------------------------------------------------------
    function rebuild() {
      const s = stateRef.current;
      if (!s) return;

      const data = s.prepared || { nodes: [], arcs: [] };
      const maxVisible = isLowPower ? 24 : 48;
      const nodes = (data.nodes || []).slice(0, maxVisible);

      // node sizing: log-based, capped
      const base = 0.035;
      const scale = (count) => {
        const raw = Math.log(1 + count) * 0.055;
        return Math.min(0.16, Math.max(base, raw));
      };

      s.nodesInst.count = nodes.length;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pos = geoToVec3(n.lat, n.lng, 1.02);
        const sc = scale(n.count);

        s.dotDummy.position.copy(pos);
        s.dotDummy.scale.setScalar(sc);
        s.dotDummy.updateMatrix();
        s.nodesInst.setMatrixAt(i, s.dotDummy.matrix);
      }
      s.nodesInst.instanceMatrix.needsUpdate = true;

      // glow sprites
      for (let i = 0; i < 64; i++) {
        const sp = s.glowSprites[i];
        if (i < nodes.length) {
          sp.visible = true;
          sp.position.copy(geoToVec3(nodes[i].lat, nodes[i].lng, 1.022));
        } else {
          sp.visible = false;
        }
      }

      // --- arcs ---
      const arcs = (data.arcs || []).slice(0, 8);
      const seg = 40;
      const arcVerts = new Float32Array(arcs.length * (seg + 1) * 3);
      let vi = 0;
      const arcData = arcs.map((a) => {
        const from = geoToVec3(a.from.lat, a.from.lng, 1.005);
        const to = geoToVec3(a.to.lat, a.to.lng, 1.005);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dir = mid.clone().normalize();
        const dist = from.distanceTo(to);
        const lift = 0.25 + dist * 0.35;
        const ctrl = dir.multiplyScalar(1 + lift);
        const curve = new THREE.QuadraticBezierCurve3(from, ctrl, to);
        for (let k = 0; k <= seg; k++) {
          const p = curve.getPoint(k / seg);
          arcVerts[vi++] = p.x; arcVerts[vi++] = p.y; arcVerts[vi++] = p.z;
        }
        return { curve, speed: 0.18 + Math.random() * 0.2, offset: Math.random() };
      });
      s.arcsGeo.setAttribute('position', new THREE.BufferAttribute(arcVerts, 3));
      s.arcsGeo.setDrawRange(0, arcData.length * (seg + 1));
      s.arcs.visible = arcData.length > 0;

      // arc moving particles
      s._arcData = arcData;
      s._arcPartsUsed = Math.min(arcData.length * 4, arcCount);
      s.arcParts.visible = arcData.length > 0;
    }

    // -------------------------------------------------------------
    // Animation loop
    // -------------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // throttle extra effects when tab is hidden
      if (document.hidden) {
        controls.update();
        renderer.render(scene, camera);
        return;
      }

      const s = stateRef.current;
      const t = clock.getElapsedTime();

      // ambient particles subtle drift
      if (s.ambientPts) {
        const pos = s.ambientPts.geometry.attributes.position.array;
        for (let i = 0; i < s.ambientVel.length; i++) {
          pos[i * 3] += Math.cos(t * s.ambientVel[i] + s.ambientSeed[i]) * 0.0006;
          pos[i * 3 + 1] += Math.sin(t * s.ambientVel[i] * 0.6 + s.ambientSeed[i]) * 0.0006;
          pos[i * 3 + 2] += Math.cos(t * s.ambientVel[i] * 0.8 + s.ambientSeed[i]) * 0.0006;
        }
        s.ambientPts.geometry.attributes.position.needsUpdate = true;
      }

      // stars slow rotation
      if (s.stars) s.stars.rotation.y += dt * 0.02;

      // node pulse
      const nodes = s.prepared?.nodes || [];
      const pulseScale = 1 + Math.sin(t * 2.2) * 0.12;
      for (let i = 0; i < nodes.length && i < s.nodesInst.count; i++) {
        const n = nodes[i];
        const base = 0.035;
        const sc = Math.min(0.16, Math.max(base, Math.log(1 + n.count) * 0.055));
        const pid = (n.ids?.[0] || '') + n.lat + n.lng;
        const phase = (pid.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100) / 100;
        const amp = 1 + Math.sin(t * 2.4 + phase * Math.PI * 2) * 0.15;

        s.dotDummy.position.copy(geoToVec3(n.lat, n.lng, 1.02));
        s.dotDummy.scale.setScalar(sc * (pulseScale * 0.6 + amp * 0.4));
        s.dotDummy.updateMatrix();
        s.nodesInst.setMatrixAt(i, s.dotDummy.matrix);

        if (s.glowSprites[i]) {
          const sp = s.glowSprites[i];
          sp.position.copy(geoToVec3(n.lat, n.lng, 1.022));
          sp.scale.setScalar(sc * 6.5 * (0.85 + amp * 0.25));
        }
      }
      if (s.nodesInst.count) s.nodesInst.instanceMatrix.needsUpdate = true;

      // arc particle motion
      const arcData = s._arcData || [];
      const partsPos = s.arcPartsPos;
      const partsUsed = s._arcPartsUsed || 0;
      const nArcs = Math.max(1, arcData.length);
      for (let i = 0; i < partsUsed; i++) {
        const arc = arcData[i % nArcs];
        if (!arc) continue;
        const lane = Math.floor(i / nArcs);
        const prog = (t * arc.speed + arc.offset + lane * 0.33) % 1;
        const p = arc.curve.getPoint(prog);
        partsPos[i * 3] = p.x; partsPos[i * 3 + 1] = p.y; partsPos[i * 3 + 2] = p.z;
      }
      if (partsUsed) s.arcPartsPts.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      cancelled = true;
      clearTimeout(rotateResumeTimer);
      controls.removeEventListener('start', pauseRotate);
      controls.removeEventListener('end', resumeRotate);
      controls.dispose();
      renderer.domElement.removeEventListener('wheel', blockWheel);
      ro.disconnect();
      container.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (glowTexture) glowTexture.dispose();
    };
  }, [isLowPower]);

  // Rebuild nodes/arcs whenever data changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    s.prepared = prepared;
    s.rebuild && s.rebuild();
  }, [prepared, dotsReady]);

  // Apply theme-aware colors to the 3D scene
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    if (s.gridMat) {
      s.gridMat.color.set(isDark ? STUDIO_GRID : 0xe5e5e5);
      s.gridMat.opacity = isDark ? 0.35 : 0.5;
    }
    if (s.surfaceMat) {
      s.surfaceMat.color.set(isDark ? STUDIO_SURFACE : 0xfcfcfc);
      s.surfaceMat.opacity = isDark ? 0.65 : 0.25;
    }
    if (s.dotMat) {
      s.dotMat.color.set(isDark ? STUDIO_WHITE : STUDIO_SLATE);
      s.dotMat.opacity = isDark ? 0.55 : 0.45;
      s.dotMat.needsUpdate = true;
    }
    if (s.haloMat) {
      s.haloMat.color.set(isDark ? 0xffffff : 0x000000);
      s.haloMat.opacity = isDark ? 0.03 : 0.02;
    }
    if (s.stars) {
      s.stars.visible = isDark;
      if (s.starMat) s.starMat.color.set(0x555555);
    }
    if (s.ambientPts) {
      s.ambientPts.visible = isDark;
      if (s.ambientMat) s.ambientMat.color.set(0x666666);
    }
    if (bgRef.current) {
      bgRef.current.style.background = 'transparent';
    }
  }, [isDark]);

  // -------------------------------------------------------------------------
  // Hover / click picking
  // -------------------------------------------------------------------------
  const handlePointerMove = useCallback((e) => {
    const container = containerRef.current;
    const s = stateRef.current;
    if (!container || !s || !s.nodesInst.count) {
      setTooltip(null);
      return;
    }
    const rect = container.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, s.camera);
    const hits = raycaster.intersectObject(s.nodesInst);
    if (hits.length > 0) {
      const idx = hits[0].instanceId;
      const nodes = s.prepared?.nodes || [];
      if (idx != null && idx < nodes.length) {
        const n = nodes[idx];
        setTooltip({ left: e.clientX - rect.left, top: e.clientY - rect.top, node: n });
        container.style.cursor = 'pointer';
        return;
      }
    }
    setTooltip(null);
    container.style.cursor = 'grab';
  }, []);

  const handlePointerLeave = useCallback(() => setTooltip(null), []);
  const handleClick = useCallback((e) => {
    const container = containerRef.current;
    const s = stateRef.current;
    if (!container || !s) return;
    const rect = container.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, s.camera);
    const hits = raycaster.intersectObject(s.nodesInst);
    if (hits.length > 0) {
      const idx = hits[0].instanceId;
      const nodes = s.prepared?.nodes || [];
      if (idx != null && idx < nodes.length) {
        onSelectLocation?.(nodes[idx]);
      }
    }
  }, [onSelectLocation]);

  const handleZoom = useCallback((dir) => {
    const s = stateRef.current;
    if (!s || !s.controls) return;
    const cam = s.camera;
    const controls = s.controls;
    const vec = new THREE.Vector3().subVectors(cam.position, controls.target);
    const current = vec.length();
    const factor = dir > 0 ? 1 / 1.3 : 1.3;
    const next = THREE.MathUtils.clamp(
      current * factor,
      controls.minDistance,
      controls.maxDistance
    );
    vec.setLength(next);
    cam.position.copy(controls.target).add(vec);
    controls.update();
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: 'grab' }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {/* Ambient background gradient behind the transparent globe */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div ref={containerRef} className="absolute inset-0" />

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(1); }}
          aria-label="Zoom in"
          title="Zoom in"
          className="h-6 w-6 flex items-center justify-center rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:border-[var(--wp-border-strong)] transition-colors shadow-sm"
        >
          <Plus className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(-1); }}
          aria-label="Zoom out"
          title="Zoom out"
          className="h-6 w-6 flex items-center justify-center rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:border-[var(--wp-border-strong)] transition-colors shadow-sm"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>

      {/* Status overlays */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-[var(--wp-bg-surface)]/60 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 text-[var(--wp-text-muted)] animate-spin mb-2" />
          <p className="wp-metric-mono text-[10.5px] uppercase tracking-wider text-[var(--wp-text-secondary)]">
            Loading geography telemetry…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6 bg-[var(--wp-bg-surface)]/80 backdrop-blur-sm">
          <Globe className="h-8 w-8 text-[var(--wp-text-muted)] mb-3" />
          <h3 className="wp-title-card mb-1">Global activity unavailable</h3>
          <p className="text-xs text-[var(--wp-text-muted)] mb-4 max-w-[220px]">
            We couldn't load visitor telemetry locations.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="wp-btn wp-btn-secondary h-7 px-3 text-xs pointer-events-auto inline-flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      )}

      {/* Compact hover tooltip */}
      {tooltip && !loading && (
        <div
          className="absolute z-30 pointer-events-none will-change-transform"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            transform: 'translate(-50%, calc(-100% - 12px))',
          }}
        >
          <div className="wp-panel bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded p-2.5 shadow-2xl min-w-[180px] font-sans">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-[var(--wp-text-primary)] truncate">
              <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">{tooltip.node.location || 'Unknown Location'}</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-[var(--wp-text-secondary)]">
                <span>Active pulses</span>
                <span className="text-[var(--wp-text-primary)] font-medium tabular-nums">{tooltip.node.count}</span>
              </div>
              {tooltip.node.path && (
                <div className="flex items-center justify-between text-[var(--wp-text-muted)]">
                  <span>Route</span>
                  <span className="truncate max-w-[110px] text-[var(--wp-text-secondary)]">{tooltip.node.path}</span>
                </div>
              )}
              {tooltip.node.device && (
                <div className="flex items-center justify-between text-[var(--wp-text-muted)]">
                  <span>Device</span>
                  <span className="capitalize text-[var(--wp-text-secondary)]">{tooltip.node.device}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-1 text-[10.5px] text-emerald-400">
                <span className="wp-live-dot" />
                <span>Active now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status pill */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-[var(--wp-bg-surface)]/85 backdrop-blur-md border border-[var(--wp-border-default)] px-2.5 py-1 rounded">
          <span className="relative flex h-1.5 w-1.5">
            {hasData ? (
              <span className="wp-live-dot" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--wp-text-muted)]" />
            )}
          </span>
          <span className="wp-metric-mono text-[10.5px] uppercase tracking-wider text-[var(--wp-text-secondary)]">
            {loading
              ? 'Loading…'
              : error
                ? 'Unavailable'
                : hasData
                  ? `Live · ${realTimeVisitors.toLocaleString()} signals`
                  : 'Idle · Telemetry ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkGlobe;
