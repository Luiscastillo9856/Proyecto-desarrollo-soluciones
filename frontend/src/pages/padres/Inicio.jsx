import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Calendar, LogOut, ChevronRight } from 'lucide-react'

const ESTADO_CLASS = {
  pagado: 'badge-green', pendiente: 'badge-yellow',
  vencido: 'badge-red',  exonerado: 'badge-gray',
}
const TIPO_COLOR = {
  entrenamiento: 'var(--accent2)', partido: 'var(--accent)',
  torneo: 'var(--warning)',        reunion: 'var(--text-muted)',
}

export default function Inicio() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [jugadores, setJugadores] = useState([])
  const [pagos,     setPagos]     = useState([])
  const [eventos,   setEventos]   = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jugadores'),
      api.get('/pagos'),
      api.get('/eventos?proximos=true'),
    ]).then(([j, p, e]) => {
      setJugadores(j.data)
      setPagos(p.data)
      setEventos(e.data.slice(0, 3))
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const pendientes = pagos.filter(p => p.estado === 'pendiente' || p.estado === 'vencido')

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem 1rem' }} className="fade-up">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bienvenido,</p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
            {usuario?.nombre} {usuario?.apellido}
          </h1>
        </div>
        <button onClick={handleLogout} style={{ color: 'var(--text-muted)', padding: '.5rem' }}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Alerta de pagos pendientes */}
      {pendientes.length > 0 && (
        <div
          onClick={() => navigate('/padres/cuotas')}
          style={{
            marginBottom: '1.5rem', padding: '1rem 1.25rem',
            borderRadius: 14, cursor: 'pointer',
            background: pendientes.some(p => p.estado === 'vencido')
              ? 'rgba(255,77,109,.1)' : 'rgba(255,184,48,.1)',
            border: `1px solid ${pendientes.some(p => p.estado === 'vencido') ? 'rgba(255,77,109,.3)' : 'rgba(255,184,48,.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{
              fontWeight: 700, fontSize: 15,
              color: pendientes.some(p => p.estado === 'vencido') ? 'var(--danger)' : 'var(--warning)',
            }}>
              {pendientes.length} cuota{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Toca para ver el detalle
            </p>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}

      {/* Jugadores (hijos) */}
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, letterSpacing: .5, color: 'var(--text-muted)', marginBottom: '.75rem' }}>
        MIS JUGADORES
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem', marginBottom: '1.75rem' }}>
        {jugadores.map(j => (
          <div key={j.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            {/* Avatar */}
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800,
              color: 'var(--accent)', flexShrink: 0,
            }}>
              {j.numero_camiseta || j.nombre[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{j.nombre} {j.apellido}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {j.categoria} · {j.posicion || 'Sin posición'}
              </p>
            </div>
            <span className={`badge ${j.estado === 'activo' ? 'badge-green' : 'badge-yellow'}`}>
              {j.estado}
            </span>
          </div>
        ))}
      </div>

      {/* Próximos eventos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, letterSpacing: .5, color: 'var(--text-muted)' }}>
          PRÓXIMOS EVENTOS
        </h2>
        <button onClick={() => navigate('/padres/calendario')} style={{ fontSize: 13, color: 'var(--accent)' }}>
          Ver todos
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.75rem' }}>
        {eventos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No hay eventos próximos.</p>
        ) : eventos.map(ev => (
          <div key={ev.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.9rem 1rem' }}>
            <div style={{
              fontFamily: 'var(--font-head)', textAlign: 'center', minWidth: 44,
              color: TIPO_COLOR[ev.tipo],
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
                {format(new Date(ev.fecha_hora), 'dd')}
              </div>
              <div style={{ fontSize: 11 }}>
                {format(new Date(ev.fecha_hora), 'MMM', { locale: es }).toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ev.titulo}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {format(new Date(ev.fecha_hora), 'HH:mm')} · {ev.lugar || 'Sin lugar'}
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: TIPO_COLOR[ev.tipo], flexShrink: 0 }}>
              {ev.tipo}
            </span>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, letterSpacing: .5, color: 'var(--text-muted)', marginBottom: '.75rem' }}>
        ACCESOS RÁPIDOS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        <button onClick={() => navigate('/padres/cuotas')} className="card" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          gap: '.5rem', cursor: 'pointer', textAlign: 'left',
          border: '1px solid var(--border)', padding: '1.1rem',
        }}>
          <CreditCard size={22} style={{ color: 'var(--warning)' }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Mis cuotas</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ver historial de pagos</span>
        </button>
        <button onClick={() => navigate('/padres/calendario')} className="card" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          gap: '.5rem', cursor: 'pointer', textAlign: 'left',
          border: '1px solid var(--border)', padding: '1.1rem',
        }}>
          <Calendar size={22} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Calendario</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entrenamientos y partidos</span>
        </button>
      </div>
    </div>
  )
}