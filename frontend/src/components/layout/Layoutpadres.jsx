import { Outlet, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, CreditCard, Calendar, Bell } from 'lucide-react'
import api from '../../services/api'

const tabs = [
  { to: '/padres',                    icon: Home,       label: 'Inicio'  },
  { to: '/padres/cuotas',             icon: CreditCard, label: 'Cuotas'  },
  { to: '/padres/calendario',         icon: Calendar,   label: 'Eventos' },
  { to: '/padres/notificaciones',     icon: Bell,       label: 'Avisos'  },
]

export default function LayoutPadres() {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    const fetchCount = () =>
      api.get('/notificaciones/no-leidas')
        .then(r => setNoLeidas(r.data.total))
        .catch(() => {})

    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--nav-h)' }}>
        <Outlet context={{ setNoLeidas }} />
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'var(--nav-h)',
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 .5rem',
        zIndex: 50,
      }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/padres'}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '.5rem',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: isActive ? 600 : 400,
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {to === '/padres/notificaciones' && noLeidas > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: '28%',
                    background: 'var(--danger)', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {noLeidas > 9 ? '9+' : noLeidas}
                  </span>
                )}
                <div style={{
                  padding: '4px 16px', borderRadius: 20,
                  background: isActive ? 'rgba(232,255,71,.1)' : 'transparent',
                  transition: 'background .2s',
                }}>
                  <Icon size={20} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}