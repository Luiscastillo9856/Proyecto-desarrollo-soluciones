# Base de datos — Academia de Fútbol

PostgreSQL 14+ · `pgcrypto` requerida

## Estructura

```
database/
├── schema.sql   ← tablas, índices y views (estructura)
├── seed.sql     ← datos de ejemplo para desarrollo
└── README.md    ← este archivo
```

## Requisitos

- PostgreSQL 14 o superior
- Usuario con permisos para crear bases de datos y extensiones

---

## Instalación

### Opción A — psql (terminal)

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE academia_futbol;"

# 2. Crear la estructura
psql -U postgres -d academia_futbol -f database/schema.sql

# 3. Cargar datos de ejemplo (solo en desarrollo)
psql -U postgres -d academia_futbol -f database/seed.sql
```

### Opción B — pgAdmin

1. Abrir pgAdmin y crear una base de datos llamada `academia_futbol`
2. Seleccionarla → abrir **Query Tool**
3. Cargar y ejecutar `schema.sql`
4. Cargar y ejecutar `seed.sql` (solo en desarrollo)

---

## Tablas

| Tabla            | Descripción                                      |
|------------------|--------------------------------------------------|
| `categorias`     | Divisiones por edad (Sub-8, Sub-10…)            |
| `jugadores`      | Los 45 jugadores de la academia                  |
| `padres_tutores` | Usuarios de la app móvil                         |
| `jugador_padre`  | Relación jugador ↔ padre/tutor (muchos a muchos) |
| `cuotas_config`  | Monto de cuota por categoría y período           |
| `pagos`          | Registro de pagos (estado, método, mes)          |
| `eventos`        | Entrenamientos, partidos, torneos, reuniones     |
| `asistencias`    | Asistencia de cada jugador a cada evento         |
| `notificaciones` | Notificaciones in-app para los padres            |

## Views

| View                  | Descripción                                |
|-----------------------|--------------------------------------------|
| `v_estado_pagos`      | Pagos por jugador con estado y categoría   |
| `v_asistencia_resumen`| Presentes/ausentes/justificados por jugador|

---

## Datos de ejemplo

El archivo `seed.sql` incluye:

- 5 categorías (Sub-8 a Sub-16)
- 25 padres/tutores (contraseña: `password123`)
- 45 jugadores (9 por categoría)
- Pagos de enero a mayo 2025 con estados variados: `pagado`, `pendiente`, `vencido` y un caso de pago doble
- 19 eventos (entrenamientos, partidos y una reunión)
- Asistencias de 4 eventos pasados
- 7 notificaciones de ejemplo

> **Importante:** No ejecutar `seed.sql` en producción.

---

## Solución de problemas

**Error: extension "pgcrypto" does not exist**
```sql
-- Ejecutar como superusuario antes del schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Error: role "postgres" does not exist**
Reemplazar `postgres` por tu usuario de PostgreSQL:
```bash
psql -U tu_usuario -d academia_futbol -f database/schema.sql
```