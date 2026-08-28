import React, { useRef, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CYAN = 0x8b5cf6;
const VIOLET = 0xa78bfa;
const GREEN = 0x48e6a1;
const GRID = 0x1c2634;
const BLUE_DOT = 0xc4b5fd;

const GEOJSON_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

const toRad = (deg) => (deg * Math.PI) / 180;

function geoToVec3(lat, lng, radius = 1) {
  const phi = toRad(90 - lat);
  const theta = toRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function pointInPolygon(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

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

function createLatLngGrid(radius = 1, segments = 24) {
  const points = [];
  const step = 360 / segments;
  for (let i = 0; i < segments; i++) {
    const lng = i * step;
    const a = new THREE.Vector3(); const b = new THREE.Vector3();
    for (let lat = -90; lat <= 90; lat += 180 / (segments / 2)) {
      const pol = Math.PI / 2 - toRad(lat);
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
  return new THREE.CanvasTexture(canvas);
}

const HeroGlobe = forwardRef(function HeroGlobe(
  { cities = [], className },
  ref
) {
  const containerRef = useRef(null);
  const stateRef = useRef({});
  const [hover, setHover] = useState(null);

  const isLowPower = useMemo(
    () => window.matchMedia?.('(max-width: 768px), (prefers-reduced-motion: reduce)').matches,
    []
  );

  const normalized = useMemo(() => {
    // Build node list with display labels and ensure each node has stable lat/lng
    return (cities || [])
      .map((c) => ({ ...c, lat: Number(c.lat), lng: Number(c.lng) }))
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
  }, [cities]);

  useImperativeHandle(ref, () => ({
    // Drive camera "zoom in" over the globe: 0 = far, 1 = fully zoomed into surface
    setProgress: (p) => {
      const s = stateRef.current;
      if (!s || !s.camera) return;
      const base = 4.4;
      const target = 1.35;
      const dist = base - (base - target) * p;
      const vec = new THREE.Vector3().subVectors(s.camera.position, s.controls.target);
      const normalized = vec.clone().normalize();
      s.camera.position.copy(s.controls.target).add(normalized.multiplyScalar(dist));
      s.camera.updateProjectionMatrix();
    },
    setAutoRotate: (v) => {
      const s = stateRef.current;
      if (s && s.controls) s.controls.autoRotate = v;
    },
    hasScene: () => !!stateRef.current.camera,
  }));

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
    camera.position.set(0, 1.1, 4.4);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.3;
    controls.maxDistance = 8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.ROTATE };

    // Pause auto-rotation while the user drags, then resume after a pause so
    // manual dragging feels responsive.
    let rotateResumeTimer = null;
    const pauseRotate = () => {
      controls.autoRotate = false;
      clearTimeout(rotateResumeTimer);
    };
    const resumeRotate = () => {
      clearTimeout(rotateResumeTimer);
      rotateResumeTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2500);
    };
    controls.addEventListener('start', pauseRotate);
    controls.addEventListener('end', resumeRotate);

    // --- Globe surface (very subtle) ---
    const surfaceMat = new THREE.MeshPhongMaterial({
      color: 0x0b1020,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(1, isLowPower ? 32 : 48, isLowPower ? 32 : 48),
      surfaceMat
    );
    sceneGroup.add(surface);

    // --- Grid lines ---
    const gridMat = new THREE.LineBasicMaterial({ color: GRID, transparent: true, opacity: 0.22 });
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(createLatLngGrid(1, isLowPower ? 16 : 24)),
      gridMat
    );
    sceneGroup.add(grid);

    // --- Atmosphere halo ---
    const haloMat = new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.34, 48, 48), haloMat);
    sceneGroup.add(halo);

    // --- Starfield (restrained) ---
    const starCount = isLowPower ? 140 : 260;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const v = new THREE.Vector3()
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(4 + Math.random() * 2.5);
      starPos[i * 3] = v.x; starPos[i * 3 + 1] = v.y; starPos[i * 3 + 2] = v.z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x8b9bc0, size: 0.02, transparent: true, opacity: 0.55, depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Dot-matrix continents ---
    const dotGeo = new THREE.SphereGeometry(0.007, 5, 5);
    const dotMat = new THREE.MeshBasicMaterial({ color: BLUE_DOT, transparent: true, opacity: 0.5, depthWrite: false });
    const landDots = new THREE.InstancedMesh(dotGeo, dotMat, 4096);
    landDots.frustumCulled = false;
    landDots.visible = false;
    sceneGroup.add(landDots);
    const dotDummy = new THREE.Object3D();

    // --- City nodes ---
    const nodeGeo = new THREE.SphereGeometry(1, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, depthWrite: false });
    const nodesInst = new THREE.InstancedMesh(nodeGeo, nodeMat, 48);
    nodesInst.frustumCulled = false;
    sceneGroup.add(nodesInst);

    const glowTex = createGlowTexture(CYAN);
    const nodeGlowMat = new THREE.SpriteMaterial({
      map: glowTex, color: CYAN, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const glowSprites = [];
    const glowGroup = new THREE.Group();
    for (let i = 0; i < 48; i++) {
      const sp = new THREE.Sprite(nodeGlowMat);
      sp.visible = false;
      sp.scale.setScalar(0.001);
      glowGroup.add(sp);
      glowSprites.push(sp);
    }
    sceneGroup.add(glowGroup);

    // --- Arcs ---
    const arcsMat = new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.35, depthWrite: false });
    const arcs = new THREE.LineSegments(new THREE.BufferGeometry(), arcsMat);
    arcs.frustumCulled = false;
    sceneGroup.add(arcs);

    // --- Arc particles (traffic) ---
    const arcCount = 40;
    const arcGeo = new THREE.BufferGeometry();
    const arcPos = new Float32Array(arcCount * 3);
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
    const arcMat = new THREE.PointsMaterial({
      color: 0xc4b5fd, size: 0.02, transparent: true, opacity: 0.95, depthWrite: false,
    });
    const arcPts = new THREE.Points(arcGeo, arcMat);
    arcPts.visible = false;
    sceneGroup.add(arcPts);

    // --- Ambient floaters (restrained, subtle drift) ---
    const ambCount = isLowPower ? 60 : 140;
    const ambGeo = new THREE.BufferGeometry();
    const ambPos = new Float32Array(ambCount * 3);
    const ambVel = new Float32Array(ambCount);
    const ambSeed = new Float32Array(ambCount);
    for (let i = 0; i < ambCount; i++) {
      const v = new THREE.Vector3().set(
        Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1
      ).normalize().multiplyScalar(1.3 + Math.random() * 0.8);
      ambPos[i * 3] = v.x; ambPos[i * 3 + 1] = v.y; ambPos[i * 3 + 2] = v.z;
      ambVel[i] = 0.1 + Math.random() * 0.4;
      ambSeed[i] = Math.random() * Math.PI * 2;
    }
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    const ambMat = new THREE.PointsMaterial({
      color: 0x8b9bc0, size: 0.012, transparent: true, opacity: 0.45, depthWrite: false,
    });
    const ambPts = new THREE.Points(ambGeo, ambMat);
    sceneGroup.add(ambPts);

    stateRef.current = {
      renderer, scene, sceneGroup, camera, controls,
      surfaceMat, gridMat, dotMat, landDots, dotDummy, dotGeo,
      nodeMat, nodesInst, nodeGeo, glowSprites, nodeGlowMat,
      arcs, arcsGeo: arcs.geometry, arcPts, arcPos, arcGeo,
      ambPts, ambPos, ambVel, ambSeed, stars, halo,
    };

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    // --- Load dot matrix ---
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error('geo fail');
        const gj = await res.json();
        if (cancelled) return;
        const dots = generateLandDots(gj?.features, isLowPower ? 2.5 : 2);
        const count = Math.min(dots.length, 4096);
        stateRef.current.landDots.count = count;
        stateRef.current.landDots.visible = count > 0;
        for (let i = 0; i < count; i++) {
          dotDummy.position.copy(dots[i]);
          dotDummy.scale.setScalar(isLowPower ? 1.6 : 1);
          dotDummy.updateMatrix();
          stateRef.current.landDots.setMatrixAt(i, dotDummy.matrix);
        }
        stateRef.current.landDots.instanceMatrix.needsUpdate = true;
      } catch {
        // fall through to grid-only globe
      }
    })();

    // --- Build arcs + nodes from cities ---
    const rebuild = () => {
      const s = stateRef.current;
      const nodes = (s._nodes || []).slice(0, 48);
      if (!nodes.length) {
        s.nodesInst.count = 0;
        s.arcsGeo.setDrawRange(0, 0);
        s.arcs.visible = false;
        s.arcPts.visible = false;
        for (let i = 0; i < 48; i++) s.glowSprites[i].visible = false;
        return;
      }
      // nodes
      s.nodesInst.count = nodes.length;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pos = geoToVec3(n.lat, n.lng, 1.02);
        const sc = 0.04 + Math.log(1 + (n.count || 1)) * 0.03;
        dotDummy.position.copy(pos);
        dotDummy.scale.setScalar(Math.min(0.16, sc));
        dotDummy.updateMatrix();
        s.nodesInst.setMatrixAt(i, dotDummy.matrix);
        glowSprites[i].visible = true;
        glowSprites[i].position.copy(geoToVec3(n.lat, n.lng, 1.022));
        glowSprites[i].scale.setScalar(sc * 7);
      }
      s.nodesInst.instanceMatrix.needsUpdate = true;

      // arcs: from busiest node (hub) to others, plus peripheral
      const top = nodes.slice(0, 6);
      const arcPairs = [];
      if (top.length >= 2) {
        const hub = top[0];
        for (let i = 1; i < top.length; i++) arcPairs.push([hub, top[i]]);
      }
      if (nodes.length >= 5) arcPairs.push([top[1], nodes[3]], [top[2], nodes[4]]);

      const seg = 40;
      const verts = new Float32Array(arcPairs.length * (seg + 1) * 3);
      let vi = 0;
      const arcData = arcPairs.map(([a, b]) => {
        const from = geoToVec3(a.lat, a.lng, 1.005);
        const to = geoToVec3(b.lat, b.lng, 1.005);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dir = mid.clone().normalize();
        const dist = from.distanceTo(to);
        const lift = 0.25 + dist * 0.35;
        const ctrl = dir.multiplyScalar(1 + lift);
        const curve = new THREE.QuadraticBezierCurve3(from, ctrl, to);
        for (let k = 0; k <= seg; k++) {
          const p = curve.getPoint(k / seg);
          verts[vi++] = p.x; verts[vi++] = p.y; verts[vi++] = p.z;
        }
        return { curve, speed: 0.16 + Math.random() * 0.22, offset: Math.random() };
      });
      s.arcsGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      s.arcsGeo.setDrawRange(0, arcData.length * (seg + 1));
      s.arcs.visible = arcData.length > 0;
      s._arcData = arcData;
      s._arcPartsUsed = Math.min(arcData.length * 4, arcCount);
      s.arcPts.visible = arcData.length > 0;
    };

    stateRef.current.rebuild = rebuild;

    // --- Pointer hover: surface-relative tooltip for a visitor-dense region ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerOverRef = { current: null };

    const updateHover = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const nodes = stateRef.current._nodes || [];
      const count = stateRef.current.nodesInst?.count ?? 0;
      if (!nodes.length || !count) {
        if (pointerOverRef.current) {
          pointerOverRef.current = null;
          setHover(null);
        }
        return;
      }

      const hits = raycaster.intersectObject(stateRef.current.nodesInst, false);
      if (hits.length) {
        const instId = hits[0].instanceId;
        const n = nodes[instId];
        if (n) {
          pointerOverRef.current = instId;
          setHover({
            id: instId,
            name: n.name,
            count: n.count || 0,
            x: clientX - rect.left,
            y: clientY - rect.top,
          });
        }
      } else if (pointerOverRef.current !== null) {
        pointerOverRef.current = null;
        setHover(null);
      }
    };

    const onPointerMove = (e) => updateHover(e.clientX, e.clientY);
    const onPointerLeave = () => {
      pointerOverRef.current = null;
      setHover(null);
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    // --- RAF loop ---
    let raf = 0;
    let last = performance.now();
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const t = clock.getElapsedTime();

      if (!document.hidden) {
        // ambient drift
        if (s.ambPts) {
          const pos = s.ambPts.geometry.attributes.position.array;
          for (let i = 0; i < s.ambVel.length; i++) {
            pos[i * 3] += Math.cos(t * s.ambVel[i] + s.ambSeed[i]) * 0.0006;
            pos[i * 3 + 1] += Math.sin(t * s.ambVel[i] * 0.6 + s.ambSeed[i]) * 0.0006;
            pos[i * 3 + 2] += Math.cos(t * s.ambVel[i] * 0.8 + s.ambSeed[i]) * 0.0006;
          }
          s.ambPts.geometry.attributes.position.needsUpdate = true;
        }
        if (s.stars) s.stars.rotation.y += dt * 0.02;

        // node pulse
        const nodes = s._nodes || [];
        for (let i = 0; i < nodes.length && i < s.nodesInst.count; i++) {
          const n = nodes[i];
          const base = 0.04 + Math.log(1 + (n.count || 1)) * 0.03;
          const pid = (n.name || '') + n.lat + n.lng;
          const phase = (pid.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100) / 100;
          const amp = 1 + Math.sin(t * 2.4 + phase * Math.PI * 2) * 0.16;
          dotDummy.position.copy(geoToVec3(n.lat, n.lng, 1.02));
          dotDummy.scale.setScalar(Math.min(0.16, base) * amp);
          dotDummy.updateMatrix();
          s.nodesInst.setMatrixAt(i, dotDummy.matrix);
          if (s.glowSprites[i]) {
            s.glowSprites[i].scale.setScalar(base * 7 * (0.9 + amp * 0.15));
          }
        }
        if (s.nodesInst.count) s.nodesInst.instanceMatrix.needsUpdate = true;

        // arc particles
        const arcData = s._arcData || [];
        const nArcs = Math.max(1, arcData.length);
        const used = s._arcPartsUsed || 0;
        for (let i = 0; i < used; i++) {
          const arc = arcData[i % nArcs];
          if (!arc) continue;
          const lane = Math.floor(i / nArcs);
          const prog = (t * arc.speed + arc.offset + lane * 0.33) % 1;
          const p = arc.curve.getPoint(prog);
          s.arcPos[i * 3] = p.x; s.arcPos[i * 3 + 1] = p.y; s.arcPos[i * 3 + 2] = p.z;
        }
        if (used) s.arcGeo.attributes.position.needsUpdate = true;
      }

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
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
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
      glowTex.dispose();
    };
  }, [isLowPower]);

  // Update nodes whenever the city list changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    s._nodes = normalized;
    if (s.rebuild) s.rebuild();
  }, [normalized]);

  return (
    <>
      <div ref={containerRef} className={className ?? 'absolute inset-0'} style={{ cursor: 'grab' }} />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 glass-obs rounded-xl px-3 py-2"
          style={{
            left: Math.min(hover.x + 16, window.innerWidth - 170),
            top: Math.min(hover.y + 16, window.innerHeight - 90),
          }}
        >
          <div className="text-xs font-semibold text-slate-100">{hover.name}</div>
          <div className="text-[11px] text-slate-400">
            <span className="metric-num font-semibold text-violet-300">{hover.count.toLocaleString()}</span>{' '}
            visitors
          </div>
        </div>
      )}
    </>
  );
});

export default HeroGlobe;
