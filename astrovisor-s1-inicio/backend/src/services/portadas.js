const fallo = (mensaje) => Object.assign(new Error(mensaje), { status: 400 })
const paletas = Object.freeze({ azul: '#142a56', verde: '#22463f', violeta: '#4d2844' })
const figuras = Object.freeze({
  cielo: 'M104 105 180 230 363 174 330 286 85 360 M256 74 363 174',
  guia: 'M85 360 104 105 256 74 180 230 330 286 363 174',
  relatos: 'M104 105 256 74 363 174 180 230 85 360 M180 230 330 286',
})
const xml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])
function ajustar(texto, tamanos, maxLineas) {
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 200 || !/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .,;:!?¡¿&"'’()\-–—]+$/u.test(texto.normalize('NFC'))) throw fallo('Texto de portada inválido: admite letras latinas básicas y Latin-1, números y puntuación común; no markup ni controles')
  // Repertorio acotado: no extrapolar el ancho a todo Unicode ni cortar palabras.
  for (const size of tamanos) {
    const limite = Math.floor(354 / (size * 1.2)), lineas = ['']
    let cabe = true
    for (const palabra of texto.normalize('NFC').trim().split(/ +/)) {
      if ([...palabra].length > limite) { cabe = false; break }
      const i = lineas.length - 1, siguiente = lineas[i] ? `${lineas[i]} ${palabra}` : palabra
      if ([...siguiente].length <= limite) lineas[i] = siguiente
      else lineas.push(palabra)
    }
    if (cabe && lineas.length <= maxLineas) return { lineas, size }
  }
  throw fallo('El texto no cabe de forma legible en la portada. Utiliza un título/autor representable antes de guardar.')
}
export function generarPortada({ titulo, autor, portada }) {
  if (!portada || typeof portada !== 'object' || Array.isArray(portada)
    || Object.keys(portada).some((k) => !['tipo', 'plantilla', 'paleta', 'procedencia', 'textoAlternativo'].includes(k))
    || portada.tipo !== 'ilustrativa' || typeof portada.plantilla !== 'string' || typeof portada.paleta !== 'string'
    || !Object.hasOwn(figuras, portada.plantilla) || !Object.hasOwn(paletas, portada.paleta)) throw fallo('Plantilla o paleta no permitida')
  const t = ajustar(titulo, [36, 32, 28, 24], 4), a = ajustar(autor, [19, 17], 3)
  const texto = (datos, y, paso, familia, color, peso) => datos.lineas.map((linea, i) => `<text x="225" y="${y + i * paso}" text-anchor="middle" fill="${color}" font-family="${familia}" font-size="${datos.size}"${peso ? ' font-weight="bold"' : ''}>${xml(linea)}</text>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="640" viewBox="0 0 450 640" role="img" aria-labelledby="t d"><title id="t">Portada ilustrativa de ${xml(titulo)}</title><desc id="d">Diseño ilustrativo de demostración; no es la cubierta original.</desc><defs><linearGradient id="f" x2="1" y2="1"><stop stop-color="${paletas[portada.paleta]}"/><stop offset="1" stop-color="#090f23"/></linearGradient></defs><rect width="450" height="640" fill="url(#f)"/><rect x="18" y="18" width="414" height="604" rx="4" fill="none" stroke="#e9d7a2" opacity=".65" stroke-width="3"/><g transform="translate(0,-24) scale(1,.78)"><g fill="#f4dfaf"><circle cx="104" cy="105" r="5"/><circle cx="256" cy="74" r="4"/><circle cx="363" cy="174" r="7"/><circle cx="180" cy="230" r="4"/><circle cx="330" cy="286" r="4"/><circle cx="85" cy="360" r="3"/></g><path d="${figuras[portada.plantilla]}" stroke="#b6d9f9" stroke-width="2" opacity=".74" fill="none"/></g>${texto(t, 350, 42, 'Georgia,serif', '#fff4dc', true)}${texto(a, 520, 23, 'sans-serif', '#f5ddb5', false)}<text x="225" y="597" text-anchor="middle" fill="#d6e1ed" font-family="sans-serif" font-size="17" letter-spacing="1">PORTADA ILUSTRATIVA</text></svg>`
}

export function rutaPortada(libro, revision) {
  return libro.portada?.plantilla ? `/api/contenidos/libros/${libro.id}/portada.svg?revision=${revision}` : libro.portadaIlustrativa
}

export function configurarPortada(datos) {
  if (!datos.portada || Object.keys(datos.portada).some((k) => !['tipo', 'plantilla', 'paleta'].includes(k))) throw fallo('Parámetros de portada no permitidos')
  generarPortada(datos)
  return { ...datos.portada, procedencia: 'Plantilla ilustrativa AstroVisor; no cubierta original', textoAlternativo: `Portada ilustrativa, no original: ${datos.titulo}` }
}
