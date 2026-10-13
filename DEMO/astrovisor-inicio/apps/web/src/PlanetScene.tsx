import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Planet } from './planets';

// Patrón original generado por código; no es un mapa astronómico.
function createSurface() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const wave = Math.sin(y * .17 + Math.sin(x * .03) * 2) * .13;
    const fleck = Math.sin(x * .08 + y * .04) * Math.cos(x * .025 - y * .05) * .16;
    const shade = Math.floor((.72 + wave + fleck) * 255);
    const offset = (y * canvas.width + x) * 4;
    pixels.data[offset] = shade; pixels.data[offset+1] = shade; pixels.data[offset+2] = shade; pixels.data[offset+3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function PlanetScene({ planet }: { planet: Planet }) {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<{reset:()=>void;zoom:(factor:number)=>void;rotate:()=>void} | undefined>(undefined);
  const spinning = useRef(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch { setError('No se pudo iniciar la vista 3D. Prueba un navegador con WebGL y aceleración gráfica. La ficha sigue disponible.'); return; }
    setError('');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x090e19);
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', `Vista ilustrativa en 3D de ${planet.nombre}`);
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 120);
    const radius = planet.radioVisual;
    camera.position.set(0, .3, 4.8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = radius * 2.5; controls.maxDistance = radius * 7;
    controls.saveState();
    const texture = createSurface();
    const geometry = new THREE.SphereGeometry(radius, 64, 48);
    const material = new THREE.MeshStandardMaterial({color:planet.colorVisual, map:texture, roughness:.85});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.z = .15; scene.add(sphere);
    scene.add(new THREE.AmbientLight(0xbacbff, 1.1));
    const key = new THREE.DirectionalLight(0xfff0d9, 3.2); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7a9aff, 1.8); rim.position.set(3, 1, -4); scene.add(rim);
    const starPositions = new Float32Array(1200 * 3);
    // Semilla fija: la selección no cambia el campo estrellado.
    let seed = 84;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i=0; i<starPositions.length; i+=3) {
      const theta = random() * Math.PI * 2; const z = random() * 2 - 1;
      const r = 30 + random() * 20; const span = Math.sqrt(1-z*z);
      starPositions[i] = r * span * Math.cos(theta); starPositions[i+1] = r*z; starPositions[i+2] = r*span*Math.sin(theta);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({color:0xaec4e3, size:.065, transparent:true, opacity:.8});
    scene.add(new THREE.Points(starGeometry, starMaterial));
    const resize = () => {
      const width = container.clientWidth; const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width/height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    actions.current = {
      reset: () => { controls.reset(); sphere.rotation.y = 0; },
      zoom: factor => { camera.position.multiplyScalar(factor); controls.update(); },
      rotate: () => { sphere.rotation.y += Math.PI/8; },
    };
    const lost = (event: Event) => { event.preventDefault(); renderer.setAnimationLoop(null); setError('Se interrumpió la vista 3D. Recarga la página para volver a iniciar la escena.'); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    let previous = 0;
    renderer.setAnimationLoop(time => {
      const delta = previous ? Math.min((time - previous)/1000, .05) : 0; previous = time;
      if (spinning.current) sphere.rotation.y += delta * .12;
      controls.update(); renderer.render(scene, camera);
    });
    return () => {
      renderer.setAnimationLoop(null); observer.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometry.dispose(); material.dispose(); texture.dispose(); starGeometry.dispose(); starMaterial.dispose();
      scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); actions.current = undefined;
    };
  }, [planet]);

  return <div className="scene-wrap">
    <div className="scene-host" ref={host}/>
    {error && <p className="scene-error" role="alert">{error}</p>}
    <p className="scene-instructions">Arrastra para orbitar · Desliza o pellizca para acercarte</p>
    <div className="scene-controls" role="group" aria-label="Controles de vista 3D">
      <button disabled={!!error} aria-label="Acercar" onClick={() => actions.current?.zoom(.85)}>+</button>
      <button disabled={!!error} aria-label="Alejar" onClick={() => actions.current?.zoom(1.15)}>−</button>
      <button disabled={!!error} onClick={() => actions.current?.rotate()}>Girar</button>
      <button disabled={!!error} aria-pressed={autoRotate} onClick={() => { spinning.current = !autoRotate; setAutoRotate(!autoRotate); }}>{autoRotate ? 'Pausar' : 'Auto rotación'}</button>
      <button disabled={!!error} onClick={() => actions.current?.reset()}>Restablecer</button>
    </div>
  </div>;
}
