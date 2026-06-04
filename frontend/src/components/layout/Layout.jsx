import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, CreditCard,
  Calendar, Bell, LogOut
} from 'lucide-react'

const nav = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/jugadores',     icon: Users,           label: 'Jugadores'      },
  { to: '/pagos',         icon: CreditCard,      label: 'Pagos'          },
  { to: '/eventos',       icon: Calendar,        label: 'Eventos'        },
  { to: '/notificaciones',icon: Bell,            label: 'Notificaciones' },
]

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '1.5rem 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 2rem' }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: 22,
            fontWeight: 800, letterSpacing: 1, lineHeight: 1.1
          }}>
            <span style={{ color: 'var(--accent)' }}>ACADEMIA</span>
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 400 }}>
              PANEL ENTRENADOR
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 .75rem' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.65rem .9rem', borderRadius: 8,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'rgba(232,255,71,.08)' : 'transparent',
                transition: 'all .15s',
                fontSize: 14,
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div style={{ padding: '1rem .75rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '.5rem .9rem', fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              {usuario?.nombre}
            </div>
            Admin
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: '.5rem', justifyContent: 'center', fontSize: 13 }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}