const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren token
router.use(verificarToken);

/**
 * GET /api/jugadores
 * Admin: lista todos los jugadores.
 * Padre: lista solo sus hijos.
 */
router.get('/', async (req, res) => {
  try {
    let query, params;

    if (req.usuario.rol === 'admin') {
      query = `
        SELECT j.id, j.nombre, j.apellido, j.fecha_nacimiento,
               j.posicion, j.estado, j.numero_camiseta,
               c.nombre AS categoria
        FROM jugadores j
        JOIN categorias c ON c.id = j.categoria_id
        ORDER BY c.nombre, j.apellido
      `;
      params = [];
    } else {
      query = `
        SELECT j.id, j.nombre, j.apellido, j.fecha_nacimiento,
               j.posicion, j.estado, j.numero_camiseta,
               c.nombre AS categoria
        FROM jugadores j
        JOIN categorias c ON c.id = j.categoria_id
        JOIN jugador_padre jp ON jp.jugador_id = j.id
        WHERE jp.padre_id = $1
        ORDER BY j.apellido
      `;
      params = [req.usuario.id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

/**
 * GET /api/jugadores/:id
 * Admin: cualquier jugador. Padre: solo sus hijos.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso del padre
    if (req.usuario.rol !== 'admin') {
      const acceso = await pool.query(
        'SELECT 1 FROM jugador_padre WHERE jugador_id = $1 AND padre_id = $2',
        [id, req.usuario.id]
      );
      if (acceso.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a este jugador' });
      }
    }

    const { rows } = await pool.query(
      `SELECT j.*, c.nombre AS categoria
       FROM jugadores j
       JOIN categorias c ON c.id = j.categoria_id
       WHERE j.id = $1`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener jugador' });
  }
});

/**
 * POST /api/jugadores  [admin]
 * Body: { nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta }
 */
router.post('/', soloAdmin, async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta } = req.body;

  if (!nombre || !apellido || !fecha_nacimiento || !categoria_id) {
    return res.status(400).json({ error: 'nombre, apellido, fecha_nacimiento y categoria_id son requeridos' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO jugadores (nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, apellido, fecha_nacimiento, posicion || null, categoria_id, numero_camiseta || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear jugador' });
  }
});

/**
 * PUT /api/jugadores/:id  [admin]
 */
router.put('/:id', soloAdmin, async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta, estado } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE jugadores
       SET nombre = COALESCE($1, nombre),
           apellido = COALESCE($2, apellido),
           fecha_nacimiento = COALESCE($3, fecha_nacimiento),
           posicion = COALESCE($4, posicion),
           categoria_id = COALESCE($5, categoria_id),
           numero_camiseta = COALESCE($6, numero_camiseta),
           estado = COALESCE($7, estado)
       WHERE id = $8
       RETURNING *`,
      [nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta, estado, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar jugador' });
  }
});

/**
 * DELETE /api/jugadores/:id  [admin]
 */
router.delete('/:id', soloAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM jugadores WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
});

/**
 * GET /api/jugadores/:id/asistencias
 * Historial de asistencias de un jugador.
 */
router.get('/:id/asistencias', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.rol !== 'admin') {
      const acceso = await pool.query(
        'SELECT 1 FROM jugador_padre WHERE jugador_id = $1 AND padre_id = $2',
        [id, req.usuario.id]
      );
      if (acceso.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a este jugador' });
      }
    }

    const { rows } = await pool.query(
      `SELECT a.estado, a.notas, a.created_at,
              e.tipo, e.titulo, e.fecha_hora, e.lugar
       FROM asistencias a
       JOIN eventos e ON e.id = a.evento_id
       WHERE a.jugador_id = $1
       ORDER BY e.fecha_hora DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
});

module.exports = router;