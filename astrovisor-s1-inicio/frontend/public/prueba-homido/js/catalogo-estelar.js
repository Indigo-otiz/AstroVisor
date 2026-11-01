/* Catálogo reducido de las estrellas que dibujan las tres constelaciones.

   FUENTE: base de datos SIMBAD (Centre de Données astronomiques de Strasbourg), consultada el 30 de octubre
   de 2026 por TAP/ADQL en el espejo https://simbad.cfa.harvard.edu/simbad/sim-tap (tablas basic, ident y allfluxes).
   - ra, dec: grados, ICRS (época J2000), tal como los publica SIMBAD.
   - V, B: magnitudes aparentes en las bandas V y B de SIMBAD; bv = B − V (índice de color, calculado).
   Betelgeuse (α Ori) es una estrella variable: V = 0.42 es el valor catalogado, no constante.
   Es una representación educativa estática: no se calcula el cielo para una fecha, hora ni lugar.
   Para actualizar: repetir la consulta (ver docs/PRUEBA-S3-HOMIDO.md) y pegar los valores. */

const e = (nombre, ra, dec, V, B) => ({ nombre, ra, dec, mag: V, bv: Math.round((B - V) * 100) / 100 })

export const CATALOGO = {
  orion: {
    estrellas: [
      e('Meissa', 83.78449002, 9.93415587, 3.66, 3.48), // λ Ori
      e('Betelgeuse', 88.79293899, 7.40706399, 0.42, 2.27), // α Ori
      e('Bellatrix', 81.28276356, 6.34970326, 1.64, 1.42), // γ Ori
      e('Alnitak', 85.18969443, -1.94257359, 1.77, 1.56), // ζ Ori
      e('Alnilam', 84.05338894, -1.20191914, 1.69, 1.51), // ε Ori
      e('Mintaka', 83.00166706, -0.29909511, 2.41, 2.02), // δ Ori
      e('Saiph', 86.93912017, -9.66960492, 2.06, 1.88), // κ Ori
      e('Rigel', 78.63446707, -8.20163836, 0.13, 0.1), // β Ori
    ],
    // cabeza–hombros, hombros–cinturón, cinturón, cinturón–pies
    trazos: [[0, 1], [0, 2], [1, 3], [2, 5], [5, 4, 3], [3, 6], [5, 7]],
  },
  'osa-mayor': {
    estrellas: [
      e('Dubhe', 165.93196461, 61.75103469, 1.79, 2.86), // α UMa
      e('Merak', 165.46033230, 56.38243365, 2.37, 2.35), // β UMa
      e('Phecda', 178.45769715, 53.69475973, 2.44, 2.45), // γ UMa
      e('Megrez', 183.85649936, 57.03261698, 3.32, 3.41), // δ UMa
      e('Alioth', 193.50728997, 55.95982296, 1.77, 1.75), // ε UMa
      e('Mizar', 200.98142617, 54.92535988, 2.22, 2.271), // ζ UMa
      e('Alkaid', 206.88515734, 49.31326673, 1.86, 1.67), // η UMa
    ],
    // recipiente (cerrado) y mango
    trazos: [[0, 1, 2, 3, 0], [3, 4, 5, 6]],
  },
  escorpio: {
    estrellas: [
      e('Graffias', 241.35930000, -19.80545278, 2.62, 2.55), // β1 Sco
      e('Dschubba', 240.08335535, -22.62170643, 2.32, 2.2), // δ Sco
      e('π Sco', 239.71297182, -26.11410795, 2.91, 2.71),
      e('σ Sco', 245.29714881, -25.59279208, 2.89, 3.02),
      e('Antares', 247.35191542, -26.43200261, 0.91, 2.75), // α Sco
      e('τ Sco', 248.97063689, -28.21601709, 2.81, 2.56),
      e('ε Sco', 252.54087839, -34.29323159, 2.29, 3.45),
      e('μ1 Sco', 252.96761815, -38.04739946, 2.98, 2.82),
      e('ζ2 Sco', 253.64585430, -42.36131583, 3.62, 4.99),
      e('η Sco', 258.03830873, -43.23918953, 3.33, 3.74),
      e('Sargas', 264.32970772, -42.99782799, 1.85, 2.29), // θ Sco
      e('ι1 Sco', 266.89616446, -40.12699736, 2.992, 3.492),
      e('κ Sco', 265.62198000, -39.02998308, 2.386, 2.211),
      e('Shaula', 263.40216718, -37.10382356, 1.63, 1.49), // λ Sco
      e('Lesath', 262.69098801, -37.29581478, 2.65, 2.48), // υ Sco
    ],
    // pinzas y cabeza, cuerpo hasta Antares, cola y aguijón
    trazos: [[0, 1, 2], [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
  },
}
