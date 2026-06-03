const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken);

/**
 * GET /api/eventos
 * Admin: todos los eventos.
 * Padre: eventos de las categorías de sus hijos + eventos globales.
 * Query params: tipo, categoria_id, desde (YYYY-MM-DD), hasta (YYYY-MM-DD), proximos=true
 */
router.get('/', async (req, res) => {
  const { tipo, categoria_id, desde, hasta, proximos } = req.query;

  try {
    const condiciones = [];
    const params      = [];
    let i = 1;

    if (req.usuario.rol !== 'admin') {
      condiciones.push(`(
        e.categoria_id IN (
          SELECT j.categoria_id FROM jugadores j
          JOIN jugador_padre jp ON jp.jugador_id = j.id
          WHERE jp.padre_id = $${i}
        )
        OR e.categoria_id IS NULL
      )`);
      params.push(req.usuario.id);
      i++;
    }

    if (tipo) {
      condiciones.push(`e.tipo = $${i}`);
      params.push(tipo);
      i++;
    }
    if (categoria_id) {
      condiciones.push(`e.categoria_id = $${i}`);
      params.push(categoria_id);
      i++;
    }
    if (proximos === 'true') {
      condiciones.push(`e.fecha_hora >= NOW()`);
    }
    if (desde) {
      condiciones.push(`e.fecha_hora >= $${i}`);
      params.push(desde);
      i++;
    }
    if (hasta) {
      condiciones.push(`e.fecha_hora <= $${i}`);
      params.push(hasta);
      i++;
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT e.id, e.tipo, e.titulo, e.descripcion, e.fecha_hora,
              e.lugar, e.rival, e.es_local, e.resultado,
              c.nombre AS categoria
       FROM eventos e
       LEFT JOIN categorias c ON c.id = e.categoria_id
       ${where}
       ORDER BY e.fecha_hora`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

/**
 * GET /api/eventos/:id
 * Detalle de un evento con lista de asistencias (admin) o solo asistencia del hijo (padre).
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows: evento } = await pool.query(
      `SELECT e.*, c.nombre AS categoria
       FROM eventos e
       LEFT JOIN categorias c ON c.id = e.categoria_id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (evento.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

    let asistencias = [];

    if (req.usuario.rol === 'admin') {
      const { rows } = await pool.query(
        `SELECT a.estado, a.notas,
                j.id AS jugador_id,
                j.nombre || ' ' || j.apellido AS jugador,
                c.nombre AS categoria
         FROM asistencias a
         JOIN jugadores j ON j.id = a.jugador_id
         JOIN categorias c ON c.id = j.categoria_id
         WHERE a.evento_id = $1
         ORDER BY c.nombre, j.apellido`,
        [req.params.id]
      );
      asistencias = rows;
    } else {
      // El padre solo ve la asistencia de sus hijos
      const { rows } = await pool.query(
        `SELECT a.estado, a.notas,
                j.nombre || ' ' || j.apellido AS jugador
         FROM asistencias a
         JOIN jugadores j ON j.id = a.jugador_id
         JOIN jugador_padre jp ON jp.jugador_id = j.id
         WHERE a.evento_id = $1 AND jp.padre_id = $2`,
        [req.params.id, req.usuario.id]
      );
      asistencias = rows;
    }

    res.json({ ...evento[0], asistencias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

/**
 * POST /api/eventos  [admin]
 * Body: { tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local }
 */
router.post('/', soloAdmin, async (req, res) => {
  const { tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local } = req.body;

  if (!tipo || !titulo || !fecha_hora) {
    return res.status(400).json({ error: 'tipo, titulo y fecha_hora son requeridos' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO eventos (tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tipo, titulo, descripcion || null, fecha_hora, lugar || null,
       categoria_id || null, rival || null, es_local ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

/**
 * PUT /api/eventos/:id  [admin]
 */
router.put('/:id', soloAdmin, async (req, res) => {
  const { tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local, resultado } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE eventos
       SET tipo         = COALESCE($1, tipo),
           titulo       = COALESCE($2, titulo),
           descripcion  = COALESCE($3, descripcion),
           fecha_hora   = COALESCE($4, fecha_hora),
           lugar        = COALESCE($5, lugar),
           categoria_id = COALESCE($6, categoria_id),
           rival        = COALESCE($7, rival),
           es_local     = COALESCE($8, es_local),
           resultado    = COALESCE($9, resultado)
       WHERE id = $10
       RETURNING *`,
      [tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local, resultado, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

/**
 * DELETE /api/eventos/:id  [admin]
 */
router.delete('/:id', soloAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM eventos WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// ─── ASISTENCIAS ──────────────────────────────────────────────────────────────

/**
 * POST /api/eventos/:id/asistencias  [admin]
 * Registrar asistencias de un evento masivamente.
 * Body: { asistencias: [{ jugador_id, estado, notas }] }
 */
router.post('/:id/asistencias', soloAdmin, async (req, res) => {
  const { asistencias } = req.body;
  const evento_id = req.params.id;

  if (!Array.isArray(asistencias) || asistencias.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de asistencias' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const a of asistencias) {
      await client.query(
        `INSERT INTO asistencias (jugador_id, evento_id, estado, notas)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (jugador_id, evento_id)
         DO UPDATE SET estado = EXCLUDED.estado, notas = EXCLUDED.notas`,
        [a.jugador_id, evento_id, a.estado || 'presente', a.notas || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `${asistencias.length} asistencias registradas` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar asistencias' });
  } finally {
    client.release();
  }
});

module.exports = router;