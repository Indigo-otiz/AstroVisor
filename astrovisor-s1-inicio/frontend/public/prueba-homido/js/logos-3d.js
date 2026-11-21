// Contornos preparados offline: una malla por capa, con espesor y detalles elevados.
export function crearRelieve(THREE, datos, textura, { opacidad = 0.55, opacidadLateral = 0.35, marcaAgua = true } = {}) {
  const grupo = new THREE.Group();
  grupo.userData.textura = textura;
  try {
    for (const capa of datos.layers) {
      if (!(capa.depth > 0) || !Number.isFinite(capa.z)) throw new Error('Profundidad de relieve inválida');
      const trazar = (Tipo, puntos) => {
        if (puntos.length < 3 || !puntos.every(p => p.length === 2 && p.every(Number.isFinite))) {
          throw new Error('Contorno de relieve inválido');
        }
        const trazo = new Tipo();
        puntos.forEach(([x, y], i) => i ? trazo.lineTo(x, y) : trazo.moveTo(x, y));
        trazo.closePath();
        return trazo;
      };
      const formas = capa.shapes.map(({ outer, holes }) => {
        const forma = trazar(THREE.Shape, outer);
        forma.holes = holes.map(p => trazar(THREE.Path, p));
        return forma;
      });
      const geometria = new THREE.ExtrudeGeometry(formas, {
        depth: capa.depth, steps: 1, bevelEnabled: false,
      });
      if (textura) {
        const posiciones = geometria.attributes.position;
        const uv = geometria.attributes.uv;
        for (let i = 0; i < posiciones.count; i++) {
          uv.setXY(i, posiciones.getX(i) + 0.5, posiciones.getY(i) * datos.width / datos.height + 0.5);
        }
      }
      const frente = new THREE.MeshStandardMaterial({
        color: textura ? '#ffffff' : capa.color,
        map: textura || null,
        roughness: 0.65,
        metalness: 0,
        transparent: marcaAgua,
        opacity: marcaAgua ? opacidad : 1.0,
        depthWrite: !marcaAgua,
      });
      const lateral = new THREE.MeshStandardMaterial({
        color: capa.color,
        roughness: 0.42,
        metalness: 0.15,
        transparent: marcaAgua,
        opacity: marcaAgua ? opacidadLateral : 1.0,
        depthWrite: !marcaAgua,
      });
      const malla = new THREE.Mesh(geometria, [frente, lateral]);
      malla.position.z = capa.z;
      grupo.add(malla);
    }
    if (!grupo.children.length) throw new Error('Relieve vacío');
    return grupo;
  } catch (error) {
    liberarRelieve(grupo);
    throw error;
  }
}

export function liberarRelieve(grupo) {
  grupo.userData.textura?.dispose();
  grupo.traverse(objeto => {
    objeto.geometry?.dispose();
    if (objeto.material) for (const material of objeto.material) material.dispose();
  });
}

export function registrarRelieves(AFRAME) {
  if (AFRAME.components['relieve-institucional']) return;
  AFRAME.registerComponent('relieve-institucional', {
    schema: {
      src: { type: 'string' },
      ancho: { default: 1 },
      opacidad: { default: 0.55 },
      marcaAgua: { default: true },
    },
    init() {
      this.cancelar = new AbortController();
      this.cargar();
    },
    async cargar() {
      try {
        const respuesta = await fetch(this.data.src, { signal: this.cancelar.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        if (this.cancelar.signal.aborted) return;
        let textura;
        if (datos.texture) {
          textura = await new AFRAME.THREE.TextureLoader().loadAsync(datos.texture);
          textura.colorSpace = AFRAME.THREE.SRGBColorSpace;
          if (this.cancelar.signal.aborted) { textura.dispose(); return; }
        }
        this.relieve = crearRelieve(AFRAME.THREE, datos, textura, {
          opacidad: this.data.opacidad,
          opacidadLateral: this.data.opacidad * 0.65,
          marcaAgua: this.data.marcaAgua,
        });
        this.relieve.scale.setScalar(this.data.ancho);
        this.el.setObject3D('relieve', this.relieve);
        this.el.emit('relieve-listo');
      } catch (error) {
        if (this.cancelar.signal.aborted) return;
        console.warn('No se pudo cargar el emblema', this.data.src, error);
        this.el.emit('relieve-error', { src: this.data.src });
      }
    },
    remove() {
      this.cancelar.abort();
      if (this.relieve) liberarRelieve(this.relieve);
      this.el.removeObject3D('relieve');
    },
  });
}

if (globalThis.AFRAME) registrarRelieves(globalThis.AFRAME);
