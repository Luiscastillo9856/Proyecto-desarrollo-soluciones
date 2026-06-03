const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken);

/**
 * GET /api/pagos
 * Admin: todos los pagos con filtros opcionales.
 * Padre: solo pagos de sus hijos.
 * Query params: estado, mes (YYYY-MM), jugador_id
 */
router.get('/', async (req, res) => {
  const { estado, mes, jugador_id } = req.query;

  try {
    const condiciones = [];
    const params      = [];
    let i = 1;

    if (req.usuario.rol !== 'admin') {
      // El padre solo ve pagos de sus hijos
      condiciones.push(`j.id IN (
        SELECT jugador_id FROM jugador_padre WHERE padre_id = $${i}
      )`);
      params.push(req.usuario.id);
      i++;
    }

    if (estado) {
      condiciones.push(`p.estado = $${i}`);
      params.push(estado);
      i++;
    }
    if (mes) {
      condiciones.push(`p.mes_correspondiente = $${i}`);
      params.push(mes);
      i++;
    }
    if (jugador_id) {
      condiciones.push(`p.jugador_id = $${i}`);
      params.push(jugador_id);
      i++;
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT p.id, p.monto, p.mes_correspondiente, p.estado,
              p.metodo_pago, p.fecha_pago, p.notas,
              j.nombre || ' ' || j.apellido AS jugador,
              c.nombre AS categoria
       FROM pagos p
       JOIN jugadores j ON j.id = p.jugador_id
       JOIN categorias c ON c.id = j.categoria_id
       ${where}
       ORDER BY p.mes_correspondiente DESC, j.apellido`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

/**
 * GET /api/pagos/resumen
 * Admin: resumen de deuda global por jugador y mes.
 */
router.get('/resumen', soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM v_estado_pagos`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen de pagos' });
  }
});

/**
 * GET /api/pagos/pendientes
 * Admin: todos los pagos pendientes o vencidos.
 */
router.get('/pendientes', soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.monto, p.mes_correspondiente, p.estado,
              j.nombre || ' ' || j.apellido AS jugador,
              c.nombre AS categoria,
              pt.nombre || ' ' || pt.apellido AS padre,
              pt.telefono, pt.email
       FROM pagos p
       JOIN jugadores j ON j.id = p.jugador_id
       JOIN categorias c ON c.id = j.categoria_id
       LEFT JOIN jugador_padre jp ON jp.jugador_id = j.id
       LEFT JOIN padres_tutores pt ON pt.id = jp.padre_id
       WHERE p.estado IN ('pendiente', 'vencido')
       ORDER BY p.estado DESC, p.mes_correspondiente, j.apellido`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos pendientes' });
  }
});

/**
 * POST /api/pagos  [admin]
 * Registrar un pago nuevo.
 * Body: { jugador_id, padre_id, monto, mes_correspondiente, estado, metodo_pago, notas }
 */
router.post('/', soloAdmin, async (req, res) => {
  const { jugador_id, padre_id, monto, mes_correspondiente, estado, metodo_pago, notas } = req.body;

  if (!jugador_id || !monto || !mes_correspondiente) {
    return res.status(400).json({ error: 'jugador_id, monto y mes_correspondiente son requeridos' });
  }

  // Validar formato YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(mes_correspondiente)) {
    return res.status(400).json({ error: 'mes_correspondiente debe tener formato YYYY-MM' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO pagos (jugador_id, padre_id, monto, mes_correspondiente, estado, metodo_pago, fecha_pago, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        jugador_id,
        padre_id || null,
        monto,
        mes_correspondiente,
        estado || 'pagado',
        metodo_pago || null,
        estado === 'pagado' ? new Date() : null,
        notas || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

/**
 * PUT /api/pagos/:id  [admin]
 * Actualizar estado de un pago (ej. marcar como pagado).
 */
router.put('/:id', soloAdmin, async (req, res) => {
  const { estado, metodo_pago, monto, notas } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE pagos
       SET estado      = COALESCE($1, estado),
           metodo_pago = COALESCE($2, metodo_pago),
           monto       = COALESCE($3, monto),
           notas       = COALESCE($4, notas),
           fecha_pago  = CASE WHEN $1 = 'pagado' THEN NOW() ELSE fecha_pago END
       WHERE id = $5
       RETURNING *`,
      [estado, metodo_pago, monto, notas, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
});

/**
 * DELETE /api/pagos/:id  [admin]
 */
router.delete('/:id', soloAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pagos WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
});

module.exports = router;