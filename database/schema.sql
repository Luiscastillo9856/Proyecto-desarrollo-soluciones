-- ============================================================
--  SISTEMA DE GESTIÓN - ACADEMIA DE FÚTBOL
--  schema.sql — Estructura de la base de datos
--  PostgreSQL 14+
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
--  TABLAS
-- ------------------------------------------------------------

-- Categorías por edad (Sub-8, Sub-10, etc.)
CREATE TABLE categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(200),
    edad_min    INT,
    edad_max    INT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Jugadores
CREATE TABLE jugadores (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE         NOT NULL,
    posicion         VARCHAR(50),          -- portero, defensa, mediocampista, delantero
    categoria_id     INT REFERENCES categorias(id),
    estado           VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','lesionado')),
    numero_camiseta  INT,
    foto_url         VARCHAR(300),
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Padres / tutores (usuarios de la app)
CREATE TABLE padres_tutores (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    telefono         VARCHAR(20),
    contrasena_hash  VARCHAR(255) NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Relación jugador ↔ padre/tutor (muchos a muchos)
CREATE TABLE jugador_padre (
    id          SERIAL PRIMARY KEY,
    jugador_id  INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
    padre_id    INT NOT NULL REFERENCES padres_tutores(id) ON DELETE CASCADE,
    relacion    VARCHAR(50) DEFAULT 'padre' CHECK (relacion IN ('padre','madre','tutor','otro')),
    UNIQUE (jugador_id, padre_id)
);

-- Configuración de cuotas por categoría y período
CREATE TABLE cuotas_config (
    id              SERIAL PRIMARY KEY,
    categoria_id    INT REFERENCES categorias(id),
    monto           NUMERIC(10,2) NOT NULL,
    descripcion     VARCHAR(200),
    vigencia_desde  DATE NOT NULL,
    vigencia_hasta  DATE
);

-- Pagos realizados
CREATE TABLE pagos (
    id                  SERIAL PRIMARY KEY,
    jugador_id          INT NOT NULL REFERENCES jugadores(id),
    padre_id            INT REFERENCES padres_tutores(id),
    monto               NUMERIC(10,2) NOT NULL,
    mes_correspondiente VARCHAR(7)    NOT NULL,  -- formato: 'YYYY-MM'
    estado              VARCHAR(20)   DEFAULT 'pagado' CHECK (estado IN ('pagado','pendiente','vencido','exonerado')),
    metodo_pago         VARCHAR(50),              -- efectivo, transferencia, etc.
    fecha_pago          TIMESTAMP,
    notas               TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Eventos: entrenamientos, partidos, torneos, reuniones
CREATE TABLE eventos (
    id           SERIAL PRIMARY KEY,
    tipo         VARCHAR(30)  NOT NULL CHECK (tipo IN ('entrenamiento','partido','torneo','reunion')),
    titulo       VARCHAR(200) NOT NULL,
    descripcion  TEXT,
    fecha_hora   TIMESTAMP    NOT NULL,
    lugar        VARCHAR(200),
    categoria_id INT REFERENCES categorias(id),  -- NULL = aplica a todas las categorías
    rival        VARCHAR(100),                    -- solo para partidos
    es_local     BOOLEAN,
    resultado    VARCHAR(20),                     -- ej. '3-1'
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Asistencias a eventos
CREATE TABLE asistencias (
    id          SERIAL PRIMARY KEY,
    jugador_id  INT NOT NULL REFERENCES jugadores(id),
    evento_id   INT NOT NULL REFERENCES eventos(id),
    estado      VARCHAR(20) DEFAULT 'presente' CHECK (estado IN ('presente','ausente','justificado','tarde')),
    notas       TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (jugador_id, evento_id)
);

-- Notificaciones in-app para padres
CREATE TABLE notificaciones (
    id         SERIAL PRIMARY KEY,
    padre_id   INT NOT NULL REFERENCES padres_tutores(id),
    tipo       VARCHAR(50) CHECK (tipo IN ('cuota_vencida','evento_proximo','resultado','aviso_general')),
    titulo     VARCHAR(200) NOT NULL,
    mensaje    TEXT,
    leida      BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
--  ÍNDICES
-- ------------------------------------------------------------
CREATE INDEX idx_pagos_jugador       ON pagos(jugador_id);
CREATE INDEX idx_pagos_estado        ON pagos(estado);
CREATE INDEX idx_pagos_mes           ON pagos(mes_correspondiente);
CREATE INDEX idx_asistencias_evento  ON asistencias(evento_id);
CREATE INDEX idx_asistencias_jugador ON asistencias(jugador_id);
CREATE INDEX idx_eventos_fecha       ON eventos(fecha_hora);
CREATE INDEX idx_notif_padre         ON notificaciones(padre_id);
CREATE INDEX idx_notif_leida         ON notificaciones(leida);

-- ------------------------------------------------------------
--  VIEWS
-- ------------------------------------------------------------

-- Estado de pagos por jugador
CREATE VIEW v_estado_pagos AS
SELECT
    j.id AS jugador_id,
    j.nombre || ' ' || j.apellido AS jugador,
    c.nombre AS categoria,
    p.mes_correspondiente,
    p.monto,
    p.estado,
    p.fecha_pago
FROM pagos p
JOIN jugadores j ON j.id = p.jugador_id
JOIN categorias c ON c.id = j.categoria_id
ORDER BY j.apellido, p.mes_correspondiente;

-- Resumen de asistencia por jugador
CREATE VIEW v_asistencia_resumen AS
SELECT
    j.id AS jugador_id,
    j.nombre || ' ' || j.apellido AS jugador,
    c.nombre AS categoria,
    COUNT(*) FILTER (WHERE a.estado = 'presente')    AS presentes,
    COUNT(*) FILTER (WHERE a.estado = 'ausente')     AS ausentes,
    COUNT(*) FILTER (WHERE a.estado = 'justificado') AS justificados,
    COUNT(*) AS total_eventos
FROM asistencias a
JOIN jugadores j ON j.id = a.jugador_id
JOIN categorias c ON c.id = j.categoria_id
GROUP BY j.id, j.nombre, j.apellido, c.nombre;