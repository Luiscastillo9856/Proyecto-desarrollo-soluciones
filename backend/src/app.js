require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ─── Middlewares globales ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/jugadores',      require('./routes/jugadores'));
app.use('/api/pagos',          require('./routes/pagos'));
app.use('/api/eventos',        require('./routes/eventos'));
app.use('/api/notificaciones', require('./routes/notificaciones'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ─── Error handler global ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Arrancar servidor ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});