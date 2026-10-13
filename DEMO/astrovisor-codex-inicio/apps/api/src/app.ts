import express from 'express';
import { planets } from './planets.js';

export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
app.get('/api/health', (_req, res) => { res.json({ status: 'ok', service: 'astrovisor-api' }); });
app.get('/api/planets', (_req, res) => { res.json(planets); });
app.use((_req, res) => { res.status(404).json({ error: 'Ruta no encontrada' }); });
