import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jugadores from './pages/Jugadores'
import Pagos from './pages/Pagos'
import Eventos from './pages/Eventos'
import Notificaciones from './pages/Notificaciones'

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  return usuario ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { usuario } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route index element={<Dashboard />} />
        <Route path="jugadores" element={<Jugadores />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="notificaciones" element={<Notificaciones />} />
      </Route>
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