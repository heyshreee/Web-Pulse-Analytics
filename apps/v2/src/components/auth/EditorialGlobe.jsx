import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import worldTopology from '../../assets/world-110m.json';

const DEG2RAD = Math.PI / 180;

function geoToVec3(lat, lng, radius = 1) {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Decodes quantized TopoJSON arcs into a flat Float32Array of line segment
 * vertices projected onto a unit sphere. Skips antimeridian jumps (> 90 deg)
 * so no stray horizontal chords slice across the globe.
 */
function buildTopologySegments(topology, radius = 1.003) {
  const { arcs = [], transform } = topology || {};
  const scale = transform?.scale || [1, 1];
  const translate = transform?.translate || [0, 0];
  const positions = [];

  for (let a = 0; a < arcs.length; a++) {
    const arc = arcs[a];
    if (!arc || arc.length < 2) continue;

    let qx = 0;
    let qy = 0;
    let prevLon = 0;
    let prevVec = null;

    for (let i = 0; i < arc.length; i++) {
      qx += arc[i][0];
      qy += arc[i][1];
      const lon = qx * scale[0] + translate[0];
      const lat = qy * scale[1] + translate[1];
      const vec = geoToVec3(lat, lon, radius);

      if (prevVec) {
        const dLon = Math.abs(lon - prevLon);
        if (dLon < 90) {
          positions.push(prevVec.x, prevVec.y, prevVec.z, vec.x, vec.y, vec.z);
        }
      }

      prevLon = lon;
      prevVec = vec;
    }
  }

  return new Float32Array(positions);
}

function createGraticulePositions(radius = 1.001, meridians = 24, parallels = 12) {
  const positions = [];

  for (let i = 0; i < meridians; i++) {
    const lng = -180 + (i * 360) / meridians;
    for (let lat = -84; lat < 84; lat += 6) {
      const a = geoToVec3(lat, lng, radius);
      const b = geoToVec3(lat + 6, lng, radius);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  for (let j = 1; j < parallels; j++) {
    const lat = -90 + (j * 180) / parallels;
    for (let lng = -180; lng < 180; lng += 6) {
      const a = geoToVec3(lat, lng, radius);
      const b = geoToVec3(lat, lng + 6, radius);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  return new Float32Array(positions);
}

function WireframeFallbackSvg() {
  return (
    <svg
      viewBox="0 0 600 320"
      className="h-full w-full select-none opacity-80"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="noir-globe-fill-v2" cx="50%" cy="62%" r="60%">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
      </defs>
      <circle
        cx="300"
        cy="340"
        r="270"
        fill="url(#noir-globe-fill-v2)"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="300"
        cy="340"
        rx="200"
        ry="270"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <ellipse
        cx="300"
        cy="340"
        rx="105"
        ry="270"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <ellipse
        cx="300"
        cy="235"
        rx="246"
        ry="42"
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />
      <ellipse
        cx="300"
        cy="155"
        rx="192"
        ry="26"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * Slowly rotating monochrome wireframe Earth with crisp white vector borders on
 * a pure #050505 sphere and Fresnel horizon rim glow.
 */
export default function EditorialGlobe({ className = '' }) {
  const containerRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    let frameId = null;
    let resizeObserver = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, 0, 2.45);
    camera.lookAt(0, 0, 0);

    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(0, -0.78, 0);
    scene.add(anchorGroup);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.y = -2.42;
    anchorGroup.add(globeGroup);

    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    coreSphere.renderOrder = 1;
    globeGroup.add(coreSphere);

    const rimGeo = new THREE.SphereGeometry(1.003, 72, 72);
    const rimMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(0xffffff) },
      },
      vertexShader: `
        varying vec3 vNormalDir;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormalDir = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormalDir;
        varying vec3 vViewDir;
        void main() {
          float ndotv = clamp(dot(normalize(vNormalDir), normalize(vViewDir)), 0.0, 1.0);
          float rim = pow(1.0 - ndotv, 4.6);
          float alpha = smoothstep(0.10, 0.94, rim) * 0.55;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.renderOrder = 4;
    anchorGroup.add(rimMesh);

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(createGraticulePositions(1.0012, 24, 12), 3)
    );
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    const gridLines = new THREE.LineSegments(gridGeo, gridMat);
    gridLines.renderOrder = 2;
    globeGroup.add(gridLines);

    const borderGeo = new THREE.BufferGeometry();
    borderGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(buildTopologySegments(worldTopology, 1.003), 3)
    );
    const borderMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    });
    const borderLines = new THREE.LineSegments(borderGeo, borderMat);
    borderLines.renderOrder = 3;
    globeGroup.add(borderLines);

    let isDragging = false;
    let lastX = 0;
    let dragVelocity = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      dragVelocity = 0;
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const deltaRot = dx * 0.0045;
      globeGroup.rotation.y += deltaRot;
      dragVelocity = deltaRot;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.releasePointerCapture?.(e.pointerId);
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const updateSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);
    }

    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isDragging) {
        if (Math.abs(dragVelocity) > 0.0002) {
          globeGroup.rotation.y += dragVelocity;
          dragVelocity *= 0.92;
        } else if (!reducedMotion) {
          globeGroup.rotation.y += dt * 0.14;
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      sphereGeo.dispose();
      sphereMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      borderGeo.dispose();
      borderMat.dispose();
      renderer.dispose();
      if (el.parentNode === container) {
        container.removeChild(el);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className={`relative w-full overflow-hidden ${className}`} aria-hidden="true">
        <WireframeFallbackSvg />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative w-full cursor-grab select-none overflow-hidden active:cursor-grabbing ${className}`}
    />
  );
}
