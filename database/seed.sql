-- ============================================================
--  SISTEMA DE GESTIÓN - ACADEMIA DE FÚTBOL
--  seed.sql — Datos de ejemplo para desarrollo y pruebas
--  Requiere haber ejecutado schema.sql primero
-- ============================================================

-- ------------------------------------------------------------
--  CATEGORÍAS
-- ------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion, edad_min, edad_max) VALUES
  ('Sub-8',  'Categoría para niños de 6 a 8 años',     6,  8),
  ('Sub-10', 'Categoría para niños de 9 a 10 años',    9,  10),
  ('Sub-12', 'Categoría para niños de 11 a 12 años',  11,  12),
  ('Sub-14', 'Categoría para jóvenes de 13 a 14 años',13,  14),
  ('Sub-16', 'Categoría para jóvenes de 15 a 16 años',15,  16);

-- ------------------------------------------------------------
--  PADRES / TUTORES
--  Contraseña de todos: password123
-- ------------------------------------------------------------
INSERT INTO padres_tutores (nombre, apellido, email, telefono, contrasena_hash) VALUES
  ('Carlos',    'Ramírez',   'carlos.ramirez@email.com',    '+56912345001', crypt('password123', gen_salt('bf'))),
  ('María',     'González',  'maria.gonzalez@email.com',    '+56912345002', crypt('password123', gen_salt('bf'))),
  ('Jorge',     'Morales',   'jorge.morales@email.com',     '+56912345003', crypt('password123', gen_salt('bf'))),
  ('Ana',       'Pérez',     'ana.perez@email.com',         '+56912345004', crypt('password123', gen_salt('bf'))),
  ('Roberto',   'Silva',     'roberto.silva@email.com',     '+56912345005', crypt('password123', gen_salt('bf'))),
  ('Claudia',   'Torres',    'claudia.torres@email.com',    '+56912345006', crypt('password123', gen_salt('bf'))),
  ('Diego',     'Flores',    'diego.flores@email.com',      '+56912345007', crypt('password123', gen_salt('bf'))),
  ('Patricia',  'Castillo',  'patricia.castillo@email.com', '+56912345008', crypt('password123', gen_salt('bf'))),
  ('Andrés',    'Vargas',    'andres.vargas@email.com',     '+56912345009', crypt('password123', gen_salt('bf'))),
  ('Lucía',     'Rojas',     'lucia.rojas@email.com',       '+56912345010', crypt('password123', gen_salt('bf'))),
  ('Fernando',  'Herrera',   'fernando.herrera@email.com',  '+56912345011', crypt('password123', gen_salt('bf'))),
  ('Valentina', 'Díaz',      'valentina.diaz@email.com',    '+56912345012', crypt('password123', gen_salt('bf'))),
  ('Hugo',      'Mendoza',   'hugo.mendoza@email.com',      '+56912345013', crypt('password123', gen_salt('bf'))),
  ('Isabel',    'Ríos',      'isabel.rios@email.com',       '+56912345014', crypt('password123', gen_salt('bf'))),
  ('Sebastián', 'Lara',      'sebastian.lara@email.com',    '+56912345015', crypt('password123', gen_salt('bf'))),
  ('Camila',    'Fuentes',   'camila.fuentes@email.com',    '+56912345016', crypt('password123', gen_salt('bf'))),
  ('Marco',     'Paredes',   'marco.paredes@email.com',     '+56912345017', crypt('password123', gen_salt('bf'))),
  ('Rosa',      'Salinas',   'rosa.salinas@email.com',      '+56912345018', crypt('password123', gen_salt('bf'))),
  ('Ernesto',   'Campos',    'ernesto.campos@email.com',    '+56912345019', crypt('password123', gen_salt('bf'))),
  ('Mónica',    'Espinoza',  'monica.espinoza@email.com',   '+56912345020', crypt('password123', gen_salt('bf'))),
  ('Patricio',  'Navarro',   'patricio.navarro@email.com',  '+56912345021', crypt('password123', gen_salt('bf'))),
  ('Daniela',   'Castro',    'daniela.castro@email.com',    '+56912345022', crypt('password123', gen_salt('bf'))),
  ('Álvaro',    'Sepúlveda', 'alvaro.sepulveda@email.com',  '+56912345023', crypt('password123', gen_salt('bf'))),
  ('Gloria',    'Jiménez',   'gloria.jimenez@email.com',    '+56912345024', crypt('password123', gen_salt('bf'))),
  ('Tomás',     'Vega',      'tomas.vega@email.com',        '+56912345025', crypt('password123', gen_salt('bf')));

-- ------------------------------------------------------------
--  JUGADORES (9 por categoría = 45 en total)
-- ------------------------------------------------------------
INSERT INTO jugadores (nombre, apellido, fecha_nacimiento, posicion, categoria_id, numero_camiseta) VALUES
-- Sub-8
  ('Matías',     'Ramírez',   '2018-03-15', 'delantero',     1,  9),
  ('Benjamín',   'González',  '2018-07-22', 'mediocampista', 1, 10),
  ('Tomás',      'Morales',   '2017-11-05', 'defensa',       1,  4),
  ('Santiago',   'Pérez',     '2018-01-30', 'portero',       1,  1),
  ('Agustín',    'Silva',     '2018-05-18', 'delantero',     1, 11),
  ('Ignacio',    'Torres',    '2017-09-12', 'defensa',       1,  5),
  ('Alonso',     'Flores',    '2018-04-08', 'mediocampista', 1,  8),
  ('Felipe',     'Castillo',  '2018-02-14', 'defensa',       1,  3),
  ('Rodrigo',    'Vargas',    '2017-12-20', 'mediocampista', 1,  6),
-- Sub-10
  ('Maximiliano','Rojas',     '2016-06-25', 'delantero',     2,  9),
  ('Nicolás',    'Herrera',   '2015-08-10', 'mediocampista', 2, 10),
  ('Gabriel',    'Díaz',      '2016-03-02', 'portero',       2,  1),
  ('Diego',      'Mendoza',   '2015-11-28', 'defensa',       2,  4),
  ('Emilio',     'Ríos',      '2016-07-14', 'delantero',     2, 11),
  ('Vicente',    'Lara',      '2015-09-05', 'defensa',       2,  3),
  ('Cristóbal',  'Fuentes',   '2016-01-19', 'mediocampista', 2,  8),
  ('Sebastián',  'Paredes',   '2015-12-07', 'defensa',       2,  5),
  ('Pablo',      'Salinas',   '2016-04-23', 'mediocampista', 2,  7),
-- Sub-12
  ('Francisco',  'Campos',    '2013-02-11', 'delantero',     3,  9),
  ('Martín',     'Espinoza',  '2014-05-30', 'mediocampista', 3, 10),
  ('Lucas',      'Navarro',   '2013-08-16', 'portero',       3,  1),
  ('Mateo',      'Castro',    '2014-01-09', 'defensa',       3,  4),
  ('Joaquín',    'Sepúlveda', '2013-10-22', 'delantero',     3, 11),
  ('Andrés',     'Jiménez',   '2014-03-14', 'mediocampista', 3,  8),
  ('Gonzalo',    'Vega',      '2013-07-01', 'defensa',       3,  3),
  ('Cristian',   'Ramírez',   '2014-06-18', 'defensa',       3,  5),
  ('Eduardo',    'González',  '2013-12-04', 'mediocampista', 3,  7),
-- Sub-14
  ('Iván',       'Morales',   '2011-04-07', 'delantero',     4,  9),
  ('Héctor',     'Pérez',     '2012-09-13', 'mediocampista', 4, 10),
  ('Oscar',      'Silva',     '2011-06-29', 'portero',       4,  1),
  ('Raúl',       'Torres',    '2012-02-17', 'defensa',       4,  4),
  ('Mario',      'Flores',    '2011-11-08', 'delantero',     4, 11),
  ('Ernesto',    'Castillo',  '2012-07-25', 'defensa',       4,  3),
  ('Esteban',    'Vargas',    '2011-03-20', 'mediocampista', 4,  8),
  ('Claudio',    'Rojas',     '2012-10-11', 'defensa',       4,  5),
  ('Mauricio',   'Herrera',   '2011-08-31', 'mediocampista', 4,  7),
-- Sub-16
  ('Javier',     'Díaz',      '2009-05-04', 'delantero',     5,  9),
  ('Rodrigo',    'Mendoza',   '2010-01-27', 'mediocampista', 5, 10),
  ('Cristóbal',  'Ríos',      '2009-09-15', 'portero',       5,  1),
  ('Felipe',     'Lara',      '2010-04-08', 'defensa',       5,  4),
  ('Alejandro',  'Fuentes',   '2009-12-21', 'delantero',     5, 11),
  ('Nicolás',    'Paredes',   '2010-08-03', 'defensa',       5,  3),
  ('Sebastián',  'Salinas',   '2009-06-19', 'mediocampista', 5,  8),
  ('Gabriel',    'Campos',    '2010-03-14', 'defensa',       5,  5),
  ('Diego',      'Espinoza',  '2009-10-30', 'mediocampista', 5,  7);

-- ------------------------------------------------------------
--  RELACIÓN JUGADOR ↔ PADRE
-- ------------------------------------------------------------
INSERT INTO jugador_padre (jugador_id, padre_id, relacion) VALUES
  (1,1,'padre'),(2,2,'madre'),(3,3,'padre'),(4,4,'madre'),(5,5,'padre'),
  (6,6,'madre'),(7,7,'padre'),(8,8,'madre'),(9,9,'padre'),
  (10,10,'madre'),(11,11,'padre'),(12,12,'madre'),(13,13,'padre'),(14,14,'madre'),(15,15,'padre'),
  (16,16,'madre'),(17,17,'padre'),(18,18,'madre'),(19,19,'padre'),
  (20,20,'madre'),(21,21,'padre'),(22,22,'madre'),(23,23,'padre'),(24,24,'madre'),(25,25,'padre'),
  (26,1,'padre'),(27,2,'madre'),(28,3,'padre'),(29,4,'madre'),(30,5,'padre'),
  (31,6,'madre'),(32,7,'padre'),(33,8,'madre'),(34,9,'padre'),
  (35,10,'madre'),(36,11,'padre'),(37,12,'madre'),(38,13,'padre'),(39,14,'madre'),(40,15,'padre'),
  (41,16,'madre'),(42,17,'padre'),(43,18,'madre'),(44,19,'padre'),(45,20,'madre');

-- ------------------------------------------------------------
--  CONFIGURACIÓN DE CUOTAS
-- ------------------------------------------------------------
INSERT INTO cuotas_config (categoria_id, monto, descripcion, vigencia_desde) VALUES
  (1, 15000, 'Cuota mensual Sub-8',  '2025-01-01'),
  (2, 18000, 'Cuota mensual Sub-10', '2025-01-01'),
  (3, 20000, 'Cuota mensual Sub-12', '2025-01-01'),
  (4, 22000, 'Cuota mensual Sub-14', '2025-01-01'),
  (5, 25000, 'Cuota mensual Sub-16', '2025-01-01');

-- ------------------------------------------------------------
--  PAGOS (enero–mayo 2025, con estados variados)
-- ------------------------------------------------------------
INSERT INTO pagos (jugador_id, padre_id, monto, mes_correspondiente, estado, metodo_pago, fecha_pago) VALUES
-- Enero
  (1,1,15000,'2025-01','pagado','efectivo','2025-01-05'),
  (2,2,15000,'2025-01','pagado','transferencia','2025-01-08'),
  (3,3,15000,'2025-01','pagado','efectivo','2025-01-10'),
  (4,4,15000,'2025-01','pagado','efectivo','2025-01-07'),
  (5,5,15000,'2025-01','pagado','transferencia','2025-01-12'),
  (10,10,18000,'2025-01','pagado','efectivo','2025-01-06'),
  (11,11,18000,'2025-01','pagado','transferencia','2025-01-09'),
  (12,12,18000,'2025-01','pagado','efectivo','2025-01-11'),
  (20,20,20000,'2025-01','pagado','efectivo','2025-01-05'),
  (21,21,20000,'2025-01','pagado','transferencia','2025-01-08'),
  (30,5,22000,'2025-01','pagado','efectivo','2025-01-07'),
  (31,6,22000,'2025-01','pagado','transferencia','2025-01-10'),
  (40,15,25000,'2025-01','pagado','efectivo','2025-01-09'),
  (41,16,25000,'2025-01','pagado','transferencia','2025-01-11'),
-- Febrero (con pendientes y vencidos)
  (1,1,15000,'2025-02','pagado','efectivo','2025-02-04'),
  (2,2,15000,'2025-02','pagado','transferencia','2025-02-07'),
  (3,3,15000,'2025-02','pendiente',NULL,NULL),
  (4,4,15000,'2025-02','pagado','efectivo','2025-02-09'),
  (5,5,30000,'2025-02','pagado','transferencia','2025-02-06'),  -- pagó doble (feb+mar)
  (10,10,18000,'2025-02','pagado','efectivo','2025-02-05'),
  (11,11,18000,'2025-02','vencido',NULL,NULL),
  (12,12,18000,'2025-02','pagado','efectivo','2025-02-10'),
  (20,20,20000,'2025-02','pagado','transferencia','2025-02-08'),
  (21,21,20000,'2025-02','pendiente',NULL,NULL),
  (30,5,22000,'2025-02','pagado','efectivo','2025-02-06'),
  (40,15,25000,'2025-02','pagado','efectivo','2025-02-09'),
-- Marzo
  (1,1,15000,'2025-03','pagado','efectivo','2025-03-03'),
  (5,5,15000,'2025-03','pagado','transferencia','2025-02-06'),  -- adelantado en feb
  (10,10,18000,'2025-03','pagado','efectivo','2025-03-05'),
  (20,20,20000,'2025-03','pagado','transferencia','2025-03-07'),
  (30,5,22000,'2025-03','pagado','efectivo','2025-03-04'),
  (40,15,25000,'2025-03','pendiente',NULL,NULL),
-- Abril y mayo
  (1,1,15000,'2025-04','pagado','efectivo','2025-04-02'),
  (10,10,18000,'2025-04','vencido',NULL,NULL),
  (20,20,20000,'2025-04','pagado','transferencia','2025-04-06'),
  (30,5,22000,'2025-04','pendiente',NULL,NULL),
  (1,1,15000,'2025-05','pagado','efectivo','2025-05-05'),
  (20,20,20000,'2025-05','pagado','transferencia','2025-05-03');

-- ------------------------------------------------------------
--  EVENTOS
-- ------------------------------------------------------------
INSERT INTO eventos (tipo, titulo, descripcion, fecha_hora, lugar, categoria_id, rival, es_local, resultado) VALUES
  ('entrenamiento','Entrenamiento Sub-8 #1',      NULL,                          '2025-05-06 16:00','Cancha principal',   1, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-10 #1',     NULL,                          '2025-05-06 17:30','Cancha auxiliar',    2, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-12 #1',     NULL,                          '2025-05-07 16:00','Cancha principal',   3, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-14 #1',     NULL,                          '2025-05-07 17:30','Cancha auxiliar',    4, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-16 #1',     NULL,                          '2025-05-08 18:00','Cancha principal',   5, NULL,            NULL, NULL),
  ('partido',      'Partido Sub-12 vs Estadio FC','Liga local jornada 5',        '2025-05-10 10:00','Estadio Municipal',  3, 'Estadio FC',    TRUE, '2-1'),
  ('partido',      'Partido Sub-14 vs Los Cóndores','Copa regional',             '2025-05-11 11:00','Cancha visitante',   4, 'Los Cóndores',  FALSE,'1-3'),
  ('entrenamiento','Entrenamiento Sub-8 #2',      NULL,                          '2025-05-13 16:00','Cancha principal',   1, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-10 #2',     NULL,                          '2025-05-13 17:30','Cancha auxiliar',    2, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-16 #2',     NULL,                          '2025-05-15 18:00','Cancha principal',   5, NULL,            NULL, NULL),
  ('partido',      'Partido Sub-16 vs Real Futuro','Liga regional jornada 8',    '2025-05-17 15:00','Estadio Municipal',  5, 'Real Futuro',   TRUE, '3-0'),
  ('entrenamiento','Entrenamiento Sub-12 #2',     NULL,                          '2025-05-20 16:00','Cancha principal',   3, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-14 #2',     NULL,                          '2025-05-21 17:30','Cancha auxiliar',    4, NULL,            NULL, NULL),
  -- Próximos eventos
  ('entrenamiento','Entrenamiento Sub-8',         NULL,                          '2026-06-10 16:00','Cancha principal',   1, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-10',        NULL,                          '2026-06-10 17:30','Cancha auxiliar',    2, NULL,            NULL, NULL),
  ('entrenamiento','Entrenamiento Sub-12',        NULL,                          '2026-06-11 16:00','Cancha principal',   3, NULL,            NULL, NULL),
  ('partido',      'Partido Sub-12 vs Atlético Norte','Liga local jornada 9',   '2026-06-14 10:00','Estadio Municipal',  3, 'Atlético Norte',TRUE, NULL),
  ('partido',      'Partido Sub-16 vs Los Pumas', 'Copa sub-16',                '2026-06-15 15:00','Cancha visitante',   5, 'Los Pumas',     FALSE,NULL),
  ('reunion',      'Reunión de padres Sub-8 y Sub-10','Reunión informativa',     '2026-06-17 19:00','Sala de reuniones',  NULL,NULL,          NULL, NULL);

-- ------------------------------------------------------------
--  ASISTENCIAS
-- ------------------------------------------------------------
-- Evento 1: Entrenamiento Sub-8
INSERT INTO asistencias (jugador_id, evento_id, estado) VALUES
  (1,1,'presente'),(2,1,'presente'),(3,1,'ausente'),(4,1,'presente'),
  (5,1,'presente'),(6,1,'justificado'),(7,1,'presente'),(8,1,'presente'),(9,1,'tarde');

-- Evento 2: Entrenamiento Sub-10
INSERT INTO asistencias (jugador_id, evento_id, estado) VALUES
  (10,2,'presente'),(11,2,'ausente'),(12,2,'presente'),(13,2,'presente'),
  (14,2,'presente'),(15,2,'ausente'),(16,2,'presente'),(17,2,'presente'),(18,2,'presente');

-- Evento 6: Partido Sub-12
INSERT INTO asistencias (jugador_id, evento_id, estado) VALUES
  (19,6,'presente'),(20,6,'presente'),(21,6,'ausente'),(22,6,'presente'),
  (23,6,'presente'),(24,6,'presente'),(25,6,'justificado'),(26,6,'presente'),(27,6,'presente');

-- Evento 7: Partido Sub-14
INSERT INTO asistencias (jugador_id, evento_id, estado) VALUES
  (28,7,'presente'),(29,7,'ausente'),(30,7,'presente'),(31,7,'presente'),
  (32,7,'ausente'),(33,7,'presente'),(34,7,'presente'),(35,7,'ausente'),(36,7,'presente');

-- ------------------------------------------------------------
--  NOTIFICACIONES
-- ------------------------------------------------------------
INSERT INTO notificaciones (padre_id, tipo, titulo, mensaje, leida) VALUES
  (2, 'cuota_vencida',  'Cuota de febrero pendiente',
      'La cuota del mes de febrero de Benjamín González está pendiente de pago. Monto: $15.000', FALSE),
  (11,'cuota_vencida',  'Cuota vencida',
      'La cuota de febrero de Nicolás Herrera está vencida. Por favor regulariza el pago.', FALSE),
  (20,'cuota_vencida',  'Cuota de abril pendiente',
      'La cuota de Martín Espinoza correspondiente a abril aún no ha sido registrada.', TRUE),
  (1, 'evento_proximo', 'Entrenamiento Sub-8 mañana',
      'Recuerda que mañana hay entrenamiento Sub-8 a las 16:00 en la Cancha principal.', TRUE),
  (3, 'evento_proximo', 'Partido Sub-12 este sábado',
      'El partido de Sub-12 vs Atlético Norte es el sábado 14 a las 10:00 en el Estadio Municipal.', FALSE),
  (10,'resultado',      'Resultado partido Sub-16',
      '¡Gran victoria! Sub-16 ganó 3-0 a Real Futuro. ¡Felicitaciones a todos los jugadores!', FALSE),
  (15,'aviso_general',  'Reunión de padres',
      'El martes 17 a las 19:00 hay reunión informativa para padres de Sub-8 y Sub-10. ¡Los esperamos!', FALSE);