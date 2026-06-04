import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CreditCard, Calendar, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function StatCard({ icon: Icon, label, value, accent, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `3px solid ${accent}`,
        transition: 'transform .15s',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>
            {label.toUpperCase()}
          </p>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
            {value}
          </p>
        </div>
        <div style={{
          background: `${accent}18`, borderRadius: 10,
          padding: 10, color: accent,
        }}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

const ESTADO_LABEL = {
  pagado: 'Pagado', pendiente: 'Pendiente',
  vencido: 'Vencido', exonerado: 'Exonerado',
}
const ESTADO_CLASS = {
  pagado: 'badge-green', pendiente: 'badge-yellow',
  vencido: 'badge-red', exonerado: 'badge-gray',
}

export default function Dashboard() {
  const [jugadores,  setJugadores]  = useState([])
  const [pendientes, setPendientes] = useState([])
  const [eventos,    setEventos]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/jugadores'),
      api.get('/pagos/pendientes'),
      api.get('/eventos?proximos=true'),
    ]).then(([j, p, e]) => {
      setJugadores(j.data)
      setPendientes(p.data)
      setEventos(e.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  // Agrupar jugadores por categoría para la gráfica
  const categorias = jugadores.reduce((acc, j) => {
    acc[j.categoria] = (acc[j.categoria] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categorias).map(([cat, total]) => ({ cat, total }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800 }}>
          DASHBOARD
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          icon={Users} label="Jugadores" value={jugadores.length}
          accent="var(--accent2)" onClick={() => navigate('/jugadores')}
        />
        <StatCard
          icon={CreditCard} label="Deudas activas" value={pendientes.length}
          accent="var(--warning)" onClick={() => navigate('/pagos')}
        />
        <StatCard
          icon={AlertTriangle} label="Pagos vencidos"
          value={pendientes.filter(p => p.estado === 'vencido').length}
          accent="var(--danger)" onClick={() => navigate('/pagos')}
        />
        <StatCard
          icon={Calendar} label="Próximos eventos" value={eventos.length}
          accent="var(--accent)" onClick={() => navigate('/eventos')}
        />
      </div>

      {/* Gráfica + Próximos eventos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Gráfica */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: '1.5rem' }}>
            JUGADORES POR CATEGORÍA
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="cat" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}
                cursor={{ fill: 'rgba(255,255,255,.04)' }}
              />
              <Bar dataKey="total" radius={[6,6,0,0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? 'var(--accent)' : 'var(--accent2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Próximos eventos */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: '1.25rem' }}>
            PRÓXIMOS EVENTOS
          </h2>
          {eventos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No hay eventos próximos.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {eventos.map(ev => (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '.65rem', borderRadius: 8, background: 'var(--surface2)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700,
                    minWidth: 44, textAlign: 'center', lineHeight: 1,
                    color: ev.tipo === 'partido' ? 'var(--accent)' : 'var(--accent2)',
                  }}>
                    {format(new Date(ev.fecha_hora), 'dd')}
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>
                      {format(new Date(ev.fecha_hora), 'MMM', { locale: es }).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.titulo}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {ev.categoria || 'Todas'} · {ev.lugar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de pagos pendientes */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>
            PAGOS PENDIENTES Y VENCIDOS
          </h2>
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/pagos')}>
            Ver todos →
          </button>
        </div>
        {pendientes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>¡Todo al día! No hay pagos pendientes.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Categoría</th>
                <th>Mes</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Contacto padre</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.slice(0, 8).map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.jugador}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.categoria}</td>
                  <td>{p.mes_correspondiente}</td>
                  <td>${Number(p.monto).toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`badge ${ESTADO_CLASS[p.estado]}`}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {p.telefono || p.email || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}