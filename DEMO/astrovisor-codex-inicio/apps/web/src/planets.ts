export interface Planet {
  id: string; nombre: string; tipo: string; descripcion: string;
  radioVisual: number; colorVisual: string;
}

export async function loadPlanets(signal?: AbortSignal): Promise<Planet[]> {
  const response = await fetch('/api/planets', { signal });
  if (!response.ok) throw new Error('No se pudo consultar la API.');
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.length || !data.every(isPlanet) || new Set(data.map(p => p.id)).size !== data.length) {
    throw new Error('La API devolvió un catálogo vacío o inválido.');
  }
  return data as Planet[];
}

function isPlanet(value: unknown): value is Planet {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return ['id', 'nombre', 'tipo', 'descripcion'].every(key => typeof p[key] === 'string' && (p[key] as string).trim().length > 0)
    && typeof p.radioVisual === 'number' && Number.isFinite(p.radioVisual) && p.radioVisual > 0 && p.radioVisual <= 10
    && typeof p.colorVisual === 'string' && /^#[\da-f]{6}$/i.test(p.colorVisual);
}
