const jwt = require('jsonwebtoken');

// Verifica que el token JWT sea válido
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, email, rol }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Permite acceso solo al entrenador (admin)
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido al entrenador' });
  }
  next();
};

// Permite acceso a admin o al padre dueño del recurso
const adminOPadrePropietario = (padreIdParam = 'padre_id') => (req, res, next) => {
  if (req.usuario.rol === 'admin') return next();

  const idRecurso = parseInt(req.params[padreIdParam] || req.body[padreIdParam]);
  if (req.usuario.id === idRecurso) return next();

  return res.status(403).json({ error: 'No tienes permiso para este recurso' });
};

module.exports = { verificarToken, soloAdmin, adminOPadrePropietario };