import { useEffect, useState } from 'react';
import { loadPlanets, type Planet } from './planets';
import { PlanetScene } from './PlanetScene';

export function App() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError('');
    const timeout = setTimeout(() => controller.abort(), 10000);
    loadPlanets(controller.signal).then(data => {
      if (!active) return;
      setPlanets(data); setSelectedId(data[0].id);
    }).catch(() => {
      if (active) setError('No pudimos cargar los planetas. Comprueba que la API esté encendida y vuelve a intentarlo.');
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  const selected = planets.find(p => p.id === selectedId);
  return <div className="app-shell">
    <header className="site-header">
      <a href="#main" className="brand" aria-label="AstroVisor, ir al contenido"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="8"/><ellipse cx="18" cy="18" rx="17" ry="5" transform="rotate(-30 18 18)"/></svg>AstroVisor<span className="brand-dot">.</span></a>
      <span className="demo-tag">Demo técnica · Etapa 1</span>
    </header>
    <main id="main">
      <section className="intro"><h1>Un universo por <em>explorar.</em></h1><p>Acércate a nuestro vecindario cósmico. Elige un planeta, cambia tu perspectiva y descubre algo nuevo.</p></section>
      {loading ? <div className="status-panel" role="status"><span className="loading-orbit"/>Consultando los planetas…</div> : error ? <div className="status-panel" role="alert"><h2>La exploración está en pausa</h2><p>{error}</p><button onClick={() => setAttempt(n => n + 1)}>Reintentar conexión</button></div> : selected && <>
        <section className="explorer" aria-label="Explorador de planetas">
          <div className="visual-side">
            <div className="planet-selector" role="group" aria-label="Seleccionar planeta">{planets.map(planet => <button key={planet.id} aria-pressed={planet.id === selectedId} onClick={() => setSelectedId(planet.id)}><span className="planet-dot" style={{background:planet.colorVisual}} aria-hidden="true"/>{planet.nombre}</button>)}</div>
            <PlanetScene planet={selected}/>
          </div>
          <article className="planet-details" aria-live="polite" aria-atomic="true">
            <div className="detail-heading"><span className="type-label">{selected.tipo}</span><h2>{selected.nombre}</h2></div>
            <p className="description">{selected.descripcion}</p>
            <dl><div><dt>Representación</dt><dd>Esfera 3D generada</dd></div><div><dt>Radio visual</dt><dd>{selected.radioVisual.toLocaleString('es-MX')} unidades</dd></div><div><dt>Fuente de datos</dt><dd>API local de AstroVisor</dd></div></dl>
            <p className="scale-note">Una mirada ilustrativa: los colores, las superficies y los tamaños son de demostración; no representan medidas ni mapas reales.</p>
          </article>
        </section>
        <div className="explorer-caption"><p><span className="connection-dot" aria-hidden="true"/>Catálogo recibido de la API · {planets.length} planetas</p><a href="/api/planets" target="_blank" rel="noreferrer">Ver datos JSON <span aria-hidden="true">↗</span></a></div>
      </>}
      <section className="demo-note"><h2>El primer paso de AstroVisor</h2><p>Esta demo conecta una interfaz web, una escena 3D y una API local. La experiencia inmersiva con Homido se validará en una etapa posterior con hardware real.</p></section>
    </main>
    <footer><span>AstroVisor · Equipo 8</span><span>Taller Full Stack / Demostración local</span></footer>
  </div>;
}
