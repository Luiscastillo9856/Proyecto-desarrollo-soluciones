# ⚽ Sistema de Gestión — Academia de Fútbol

Sistema web para la gestión de una academia de fútbol con múltiples categorías. Permite al entrenador llevar el control digital de jugadores, pagos, asistencias y eventos, y a los padres consultar el estado de cuotas y calendario desde su celular.

---

## Estructura del repositorio

```
academia-futbol/
├── database/               ← Esquema y datos de ejemplo
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
├── backend/                ← API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js
│   │   ├── config/db.js
│   │   ├── middlewares/auth.middleware.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── jugadores.js
│   │       ├── pagos.js
│   │       ├── eventos.js
│   │       └── notificaciones.js
│   ├── database/migrations/001_add_rol.sql
│   ├── .env.example
│   └── package.json
└── frontend/               ← App web unificada (React + Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js
    │   ├── components/layout/
    │   │   ├── LayoutAdmin.jsx
    │   │   └── LayoutPadres.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── admin/
    │       │   ├── Dashboard.jsx
    │       │   ├── Jugadores.jsx
    │       │   ├── Pagos.jsx
    │       │   ├── Eventos.jsx
    │       │   └── Notificaciones.jsx
    │       └── padres/
    │           ├── Inicio.jsx
    │           ├── Cuotas.jsx
    │           ├── Calendario.jsx
    │           └── Notificaciones.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Requisitos

- Node.js 18+
- PostgreSQL 14+

---

## Instalación y puesta en marcha

### 1. Base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE academia_futbol;"

# Crear tablas, índices y views
psql -U postgres -d academia_futbol -f database/schema.sql

# Cargar datos de ejemplo (solo desarrollo)
psql -U postgres -d academia_futbol -f database/seed.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # Editar con tus credenciales de PostgreSQL

# Aplicar migración de roles (una sola vez)
psql -U postgres -d academia_futbol -f database/migrations/001_add_rol.sql

npm run dev                 # Servidor en http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # App en http://localhost:5173
```

---

## Credenciales de prueba

| Rol        | Email                       | Contraseña   |
|------------|-----------------------------|--------------|
| Entrenador | entrenador@academia.com     | admin1234    |
| Padre      | carlos.ramirez@email.com    | password123  |
| Padre      | maria.gonzalez@email.com    | password123  |

> El sistema detecta el rol automáticamente y redirige a la vista correspondiente.

---

## Funcionalidades

### Panel del Entrenador (`/admin`)
- **Dashboard**: resumen de jugadores, deudas activas, pagos vencidos y próximos eventos con gráfica por categoría
- **Jugadores**: CRUD completo con búsqueda y filtro por categoría
- **Pagos**: registro de cuotas, filtros por estado y mes, marcado rápido de pagados
- **Eventos**: creación de entrenamientos/partidos/torneos/reuniones con registro masivo de asistencias
- **Notificaciones**: envío de avisos a todos los padres o a grupos específicos

### App para Padres (`/padres`)
- **Inicio**: resumen del hijo, alerta de deuda y próximos eventos
- **Cuotas**: historial de pagos con totales y filtros por estado
- **Calendario**: eventos agrupados por mes con filtro próximos/pasados
- **Avisos**: notificaciones del entrenador con lectura individual o masiva

---

## Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Base de datos | PostgreSQL 14+               |
| Backend    | Node.js, Express, JWT, bcryptjs   |
| Frontend   | React 18, Vite, React Router v6   |
| Gráficas   | Recharts                          |
| Íconos     | Lucide React                      |
| Fechas     | date-fns                          |

---

## API — Endpoints principales

| Método | Ruta                              | Acceso        | Descripción                      |
|--------|-----------------------------------|---------------|----------------------------------|
| POST   | `/api/auth/login`                 | Público       | Inicio de sesión                 |
| GET    | `/api/jugadores`                  | Admin / Padre | Lista jugadores                  |
| GET    | `/api/pagos/pendientes`           | Admin         | Pagos pendientes y vencidos      |
| PUT    | `/api/pagos/:id`                  | Admin         | Actualizar/marcar pago           |
| POST   | `/api/eventos`                    | Admin         | Crear evento                     |
| POST   | `/api/eventos/:id/asistencias`    | Admin         | Registrar asistencias masivas    |
| POST   | `/api/notificaciones`             | Admin         | Enviar notificación a padres     |
| PATCH  | `/api/notificaciones/leer-todas`  | Padre         | Marcar todas como leídas         |

Ver documentación completa en `backend/README.md`.

---

## Variables de entorno

Crear el archivo `backend/.env` basado en `backend/.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academia_futbol
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=clave_secreta_larga
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## Notas de desarrollo

- El archivo `seed.sql` incluye **45 jugadores**, **25 padres** y eventos hasta 2026. No ejecutar en producción.
- Las contraseñas de los padres de prueba son `password123`. Cambiarlas antes de producción.
- El frontend usa un proxy de Vite para redirigir `/api/*` al backend en `localhost:3000`.
- Los padres no pueden registrarse solos; el entrenador debe crearles la cuenta vía `POST /api/auth/registro-padre`.