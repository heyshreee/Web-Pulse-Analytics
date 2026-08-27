import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { X, MapPin, TrendingUp, RefreshCw, Loader2, Globe, Plus, Minus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
const PURPLE = 0x8b5cf6;
const BLUE = 0x60a5fa;
const GRID = 0x334155;

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
    for (let lng = -180; lng <= 180; lng += stepDeg) {
      const point = [lng, lat];
      for (let i = 0; i < polygons.length; i++) {
        if (pointInPolygon(point, polygons[i])) {
          dots.push(geoToVec3(lat + stepDeg * 0.3, lng + stepDeg * 0.3, 1.001));
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
    // Disable all mouse-drag interaction (rotate and any drag-zoom) so the
    // globe only auto-rotates. Zoom is controlled by the on-screen buttons.
    controls.enableRotate = false;
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
    const gridMat = new THREE.LineBasicMaterial({ color: GRID, transparent: true, opacity: 0.18 });
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(createLatLngGrid(1, isLowPower ? 16 : 24)),
      gridMat
    );
    sceneGroup.add(grid);

    const surfaceMat = new THREE.MeshPhongMaterial({
      color: 0x0b1020,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(1, isLowPower ? 32 : 48, isLowPower ? 32 : 48),
      surfaceMat
    );
    sceneGroup.add(surface);

    // --- Atmosphere halo (subtle) ---
    const haloMat = new THREE.MeshBasicMaterial({
      color: PURPLE,
      transparent: true,
      opacity: 0.06,
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
      color: 0x8b9bc0, size: 0.02, transparent: true, opacity: 0.6, depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    // --- Dot-matrix continents (instanced) ---
    const dotGeo = new THREE.SphereGeometry(0.008, 5, 5);
    const dotMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.6, depthWrite: false });
    const landDots = new THREE.InstancedMesh(dotGeo, dotMat, 4096);
    landDots.frustumCulled = false;
    landDots.visible = false;
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
      color: 0x8b9bc0, size: 0.012, transparent: true, opacity: 0.5, depthWrite: false,
    });
    const ambientPts = new THREE.Points(ambientGeo, ambientMat);
    sceneGroup.add(ambientPts);

    // --- Nodes (instanced spheres + additive glow sprites) ---
    const nodeGeo = new THREE.SphereGeometry(1, 12, 12);
    const nodeMatInst = new THREE.MeshBasicMaterial({ color: PURPLE, transparent: true, depthWrite: false });
    const nodesInst = new THREE.InstancedMesh(nodeGeo, nodeMatInst, 64);
    nodesInst.frustumCulled = false;
    sceneGroup.add(nodesInst);

    const glowTexture = createGlowTexture(PURPLE);
    const nodeGlowMat = new THREE.SpriteMaterial({
      map: glowTexture, color: PURPLE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
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
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5, depthWrite: false })
    );
    arcs.frustumCulled = false;
    sceneGroup.add(arcs);

    // Arc particles (points travelling along arcs)
    const arcCount = 48;
    const arcPartsPts = new THREE.BufferGeometry();
    const arcPartsPos = new Float32Array(arcCount * 3);
    arcPartsPts.setAttribute('position', new THREE.BufferAttribute(arcPartsPos, 3));
    const arcPartsMat = new THREE.PointsMaterial({
      color: 0xbfdbfe, size: 0.018, transparent: true, opacity: 0.9, depthWrite: false,
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
      const count = Math.min(dots.length, 4096);
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
      s.gridMat.color.set(isDark ? 0x334155 : 0x94a3b8);
      s.gridMat.opacity = isDark ? 0.18 : 0.4;
    }
    if (s.surfaceMat) {
      s.surfaceMat.color.set(isDark ? 0x0b1020 : 0xffffff);
      s.surfaceMat.opacity = isDark ? 0.5 : 0.16;
    }
    if (s.dotMat) {
      s.dotMat.color.set(isDark ? BLUE : 0x64748b);
      s.dotMat.opacity = isDark ? 0.6 : 0.5;
      s.dotMat.needsUpdate = true;
    }
    if (s.stars) s.stars.visible = isDark;
    if (s.ambientPts) s.ambientPts.visible = isDark;
    if (bgRef.current) {
      bgRef.current.style.background = isDark
        ? 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(139,92,246,0.10) 0%, rgba(96,165,250,0.05) 38%, rgba(6,8,15,0) 70%)'
        : 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(139,92,246,0.08) 0%, rgba(96,165,250,0.04) 40%, rgba(255,255,255,0) 72%)';
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
      className="relative w-full h-full overflow-hidden rounded-2xl"
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
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(1); }}
          aria-label="Zoom in"
          title="Zoom in"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 shadow-sm transition-colors hover:text-violet-600 dark:hover:text-violet-400 hover:border-slate-300 dark:hover:border-slate-600"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(-1); }}
          aria-label="Zoom out"
          title="Zoom out"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 shadow-sm transition-colors hover:text-violet-600 dark:hover:text-violet-400 hover:border-slate-300 dark:hover:border-slate-600"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Status overlays */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-semibold">
            Loading visitor data
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6">
          <Globe className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Global activity unavailable</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-[220px]">
            We couldn't load visitor locations.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-secondary btn-sm pointer-events-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          )}
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-4 text-violet-400/80">
            <span className="block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="block h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Waiting for visitor activity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px]">
            Connect your tracker to see visitors appear in real time.
          </p>
        </div>
      )}

      {/* Compact hover tooltip */}
      {tooltip && !loading && (
        <div
          className="absolute z-30 pointer-events-none will-change-transform"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            transform: 'translate(-50%, calc(-100% - 14px))',
          }}
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3.5 py-2.5 min-w-[190px]">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                {tooltip.node.location || 'Unknown Location'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Active visitors</span>
                <span className="font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                  {tooltip.node.count.toLocaleString()}
                </span>
              </div>
              {tooltip.node.path && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Current page</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                    {tooltip.node.path}
                  </span>
                </div>
              )}
              {tooltip.node.device && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Device</span>
                  <span className="capitalize text-slate-700 dark:text-slate-300">{tooltip.node.device}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold pt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Active now
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status pill */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 px-3 py-1.5 rounded-full">
          <span className={`relative flex h-2 w-2 ${error ? '' : 'true'}`}>
            {error ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            ) : hasData ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400" />
            )}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-slate-600 dark:text-slate-300">
            {loading
              ? 'Loading'
              : error
                ? 'Unavailable'
                : hasData
                  ? `Live · ${realTimeVisitors.toLocaleString()} visitors`
                  : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkGlobe;
