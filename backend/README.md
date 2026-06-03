# Backend — Academia de Fútbol

API REST con Node.js + Express + PostgreSQL.

## Requisitos

- Node.js 18+
- PostgreSQL con la base de datos creada (ver `database/`)

## Instalación

```bash
cd backend
npm install

# Copiar el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Aplicar la migración de roles
psql -U postgres -d academia_futbol -f database/migrations/001_add_rol.sql
```

## Ejecutar

```bash
npm run dev   # desarrollo (nodemon)
npm start     # producción
```

El servidor corre en `http://localhost:3000` por defecto.

---

## Credenciales de prueba

| Rol        | Email                      | Contraseña  |
|------------|----------------------------|-------------|
| Admin      | entrenador@academia.com    | admin1234   |
| Padre      | carlos.ramirez@email.com   | password123 |

---

## Endpoints

Todos los endpoints (excepto login) requieren header:
```
Authorization: Bearer <token>
```

### Auth

| Método | Ruta                        | Acceso | Descripción              |
|--------|-----------------------------|--------|--------------------------|
| POST   | `/api/auth/login`           | Todos  | Iniciar sesión           |
| POST   | `/api/auth/registro-padre`  | Admin  | Registrar nuevo padre    |

**Body login:**
```json
{ "email": "...", "password": "..." }
```

---

### Jugadores

| Método | Ruta                            | Acceso        | Descripción                        |
|--------|---------------------------------|---------------|------------------------------------|
| GET    | `/api/jugadores`                | Admin / Padre | Lista jugadores (padre: solo hijos)|
| GET    | `/api/jugadores/:id`            | Admin / Padre | Detalle de jugador                 |
| POST   | `/api/jugadores`                | Admin         | Crear jugador                      |
| PUT    | `/api/jugadores/:id`            | Admin         | Actualizar jugador                 |
| DELETE | `/api/jugadores/:id`            | Admin         | Eliminar jugador                   |
| GET    | `/api/jugadores/:id/asistencias`| Admin / Padre | Historial de asistencias           |

---

### Pagos

| Método | Ruta                    | Acceso        | Descripción                          |
|--------|-------------------------|---------------|--------------------------------------|
| GET    | `/api/pagos`            | Admin / Padre | Lista pagos (padre: solo sus hijos)  |
| GET    | `/api/pagos/resumen`    | Admin         | Vista completa v_estado_pagos        |
| GET    | `/api/pagos/pendientes` | Admin         | Pendientes y vencidos con datos del padre |
| POST   | `/api/pagos`            | Admin         | Registrar pago                       |
| PUT    | `/api/pagos/:id`        | Admin         | Actualizar pago                      |
| DELETE | `/api/pagos/:id`        | Admin         | Eliminar pago                        |

**Query params GET /api/pagos:** `estado`, `mes` (YYYY-MM), `jugador_id`

---

### Eventos

| Método | Ruta                              | Acceso        | Descripción                     |
|--------|-----------------------------------|---------------|---------------------------------|
| GET    | `/api/eventos`                    | Admin / Padre | Lista eventos                   |
| GET    | `/api/eventos/:id`                | Admin / Padre | Detalle + asistencias del evento|
| POST   | `/api/eventos`                    | Admin         | Crear evento                    |
| PUT    | `/api/eventos/:id`                | Admin         | Actualizar evento / resultado   |
| DELETE | `/api/eventos/:id`                | Admin         | Eliminar evento                 |
| POST   | `/api/eventos/:id/asistencias`    | Admin         | Registrar asistencias masivas   |

**Query params GET /api/eventos:** `tipo`, `categoria_id`, `desde`, `hasta`, `proximos=true`

---

### Notificaciones

| Método | Ruta                                  | Acceso        | Descripción                   |
|--------|---------------------------------------|---------------|-------------------------------|
| GET    | `/api/notificaciones`                 | Admin / Padre | Lista notificaciones          |
| GET    | `/api/notificaciones/no-leidas`       | Admin / Padre | Conteo de no leídas           |
| POST   | `/api/notificaciones`                 | Admin         | Enviar notificación           |
| PATCH  | `/api/notificaciones/:id/leer`        | Admin / Padre | Marcar una como leída         |
| PATCH  | `/api/notificaciones/leer-todas`      | Padre         | Marcar todas como leídas      |

**Body POST notificaciones:**
```json
{
  "padre_ids": [1, 2, 3],
  "tipo": "aviso_general",
  "titulo": "Entrenamiento cancelado",
  "mensaje": "El entrenamiento del martes queda cancelado."
}
```
> `padre_ids` puede ser `"todos"` para notificar a todos los padres.