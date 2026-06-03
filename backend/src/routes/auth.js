const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');

const generarToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/**
 * POST /api/auth/login
 * Inicio de sesión para padres y entrenador.
 * Body: { email, password }
 *
 * El entrenador se autentica con un usuario especial en padres_tutores
 * cuyo rol queda guardado en el JWT. Para crearlo usa el endpoint de abajo.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    // Buscar en padres_tutores (incluye al entrenador si lo registraste ahí)
    const { rows } = await pool.query(
      'SELECT id, nombre, apellido, email, contrasena_hash, rol FROM padres_tutores WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.contrasena_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generarToken({
      id:    usuario.id,
      email: usuario.email,
      rol:   usuario.rol || 'padre',
      nombre: `${usuario.nombre} ${usuario.apellido}`,
    });

    res.json({
      token,
      usuario: {
        id:      usuario.id,
        nombre:  usuario.nombre,
        apellido:usuario.apellido,
        email:   usuario.email,
        rol:     usuario.rol || 'padre',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/auth/registro-padre
 * Solo el entrenador puede registrar nuevos padres.
 * Body: { nombre, apellido, email, telefono, password }
 */
router.post('/registro-padre', async (req, res) => {
  const { nombre, apellido, email, telefono, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son requeridos' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO padres_tutores (nombre, apellido, email, telefono, contrasena_hash, rol)
       VALUES ($1, $2, $3, $4, $5, 'padre')
       RETURNING id, nombre, apellido, email`,
      [nombre, apellido, email, telefono || null, hash]
    );

    res.status(201).json({ message: 'Padre registrado exitosamente', padre: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;