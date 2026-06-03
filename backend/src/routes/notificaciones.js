const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken);

/**
 * GET /api/notificaciones
 * Admin: todas. Padre: solo las suyas.
 */
router.get('/', async (req, res) => {
  try {
    let query, params;

    if (req.usuario.rol === 'admin') {
      query = `
        SELECT n.*, pt.nombre || ' ' || pt.apellido AS padre
        FROM notificaciones n
        JOIN padres_tutores pt ON pt.id = n.padre_id
        ORDER BY n.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT id, tipo, titulo, mensaje, leida, created_at
        FROM notificaciones
        WHERE padre_id = $1
        ORDER BY created_at DESC
      `;
      params = [req.usuario.id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

/**
 * GET /api/notificaciones/no-leidas
 * Cantidad de notificaciones no leídas del padre autenticado.
 */
router.get('/no-leidas', async (req, res) => {
  try {
    const padre_id = req.usuario.rol === 'admin' ? null : req.usuario.id;
    const where = padre_id ? 'WHERE padre_id = $1 AND leida = FALSE' : 'WHERE leida = FALSE';
    const params = padre_id ? [padre_id] : [];

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM notificaciones ${where}`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al contar notificaciones' });
  }
});

/**
 * POST /api/notificaciones  [admin]
 * Enviar una notificación a uno o varios padres.
 * Body: { padre_ids: [1,2,3], tipo, titulo, mensaje }
 *       padre_ids puede ser 'todos' para notificar a todos
 */
router.post('/', soloAdmin, async (req, res) => {
  const { padre_ids, tipo, titulo, mensaje } = req.body;

  if (!titulo || !tipo) {
    return res.status(400).json({ error: 'titulo y tipo son requeridos' });
  }

  try {
    let ids = [];

    if (padre_ids === 'todos') {
      const { rows } = await pool.query('SELECT id FROM padres_tutores WHERE rol = $1', ['padre']);
      ids = rows.map(r => r.id);
    } else if (Array.isArray(padre_ids)) {
      ids = padre_ids;
    } else {
      return res.status(400).json({ error: 'padre_ids debe ser un array o "todos"' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const padre_id of ids) {
        await client.query(
          `INSERT INTO notificaciones (padre_id, tipo, titulo, mensaje)
           VALUES ($1, $2, $3, $4)`,
          [padre_id, tipo, titulo, mensaje || null]
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ message: `Notificación enviada a ${ids.length} padres` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

/**
 * PATCH /api/notificaciones/:id/leer
 * El padre marca una notificación como leída.
 */
router.patch('/:id/leer', async (req, res) => {
  try {
    const where = req.usuario.rol === 'admin'
      ? 'WHERE id = $1'
      : 'WHERE id = $1 AND padre_id = $2';
    const params = req.usuario.rol === 'admin'
      ? [req.params.id]
      : [req.params.id, req.usuario.id];

    const { rowCount } = await pool.query(
      `UPDATE notificaciones SET leida = TRUE ${where}`,
      params
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

/**
 * PATCH /api/notificaciones/leer-todas
 * El padre marca todas sus notificaciones como leídas.
 */
router.patch('/leer-todas', async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE padre_id = $1',
      [req.usuario.id]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

module.exports = router;