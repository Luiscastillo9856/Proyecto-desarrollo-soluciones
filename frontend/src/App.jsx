import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// Layouts
import LayoutAdmin  from './components/layout/LayoutAdmin'
import LayoutPadres from './components/layout/Layoutpadres.jsx'

// Páginas compartidas
import Login from './pages/Login'

// Páginas admin
import Dashboard      from './pages/admin/Dashboard'
import Jugadores      from './pages/admin/Jugadores'
import Pagos          from './pages/admin/Pagos'
import Eventos        from './pages/admin/Eventos'
import NotifAdmin     from './pages/admin/Notificaciones'

// Páginas padres
import Inicio         from './pages/padres/Inicio'
import Cuotas         from './pages/padres/Cuotas'
import Calendario     from './pages/padres/Calendario'
import NotifPadres    from './pages/padres/Notificaciones'

// Ruta protegida genérica
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  return usuario ? children : <Navigate to="/login" replace />
}

// Redirige según el rol al hacer login
function RutaRaiz() {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return usuario.rol === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/padres" replace />
}

function AppRoutes() {
  const { usuario } = useAuth()

  return (
    <Routes>
      {/* Raíz: redirige según rol */}
      <Route path="/" element={<RutaRaiz />} />

      {/* Login: si ya está autenticado redirige según rol */}
      <Route
        path="/login"
        element={
          usuario
            ? <Navigate to={usuario.rol === 'admin' ? '/admin' : '/padres'} replace />
            : <Login />
        }
      />

      {/* Rutas del entrenador */}
      <Route path="/admin" element={<RutaProtegida><LayoutAdmin /></RutaProtegida>}>
        <Route index element={<Dashboard />} />
        <Route path="jugadores"      element={<Jugadores />} />
        <Route path="pagos"          element={<Pagos />} />
        <Route path="eventos"        element={<Eventos />} />
        <Route path="notificaciones" element={<NotifAdmin />} />
      </Route>

      {/* Rutas de padres */}
      <Route path="/padres" element={<RutaProtegida><LayoutPadres /></RutaProtegida>}>
        <Route index element={<Inicio />} />
        <Route path="cuotas"         element={<Cuotas />} />
        <Route path="calendario"     element={<Calendario />} />
        <Route path="notificaciones" element={<NotifPadres />} />
      </Route>

      {/* Cualquier ruta desconocida → raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}