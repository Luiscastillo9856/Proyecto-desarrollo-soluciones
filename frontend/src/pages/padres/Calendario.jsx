import { useEffect, useState } from 'react'
import { format, isToday, isFuture, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Clock, Shield } from 'lucide-react'
import api from '../../services/api'

const TIPO_COLOR = {
  entrenamiento: 'var(--accent2)', partido: 'var(--accent)',
  torneo: 'var(--warning)',        reunion: 'var(--text-muted)',
}
const TIPO_BG = {
  entrenamiento: 'rgba(61,255,160,.1)', partido: 'rgba(232,255,71,.1)',
  torneo: 'rgba(255,184,48,.1)',         reunion: 'rgba(122,128,153,.1)',
}

export default function Calendario() {
  const [eventos, setEventos] = useState([])
  const [filtro,  setFiltro]  = useState('proximos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/eventos').then(r => setEventos(r.data)).finally(() => setLoading(false))
  }, [])

  const ahora = new Date()
  const filtrados = eventos.filter(ev => {
    const fecha = new Date(ev.fecha_hora)
    if (filtro === 'proximos') return isFuture(fecha) || isToday(fecha)
    if (filtro === 'pasados')  return isPast(fecha) && !isToday(fecha)
    return true
  })

  // Agrupar por mes
  const porMes = filtrados.reduce((acc, ev) => {
    const key = format(new Date(ev.fecha_hora), 'MMMM yyyy', { locale: es })
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})

  return (
    <div style={{ padding: '1.5rem 1rem' }} className="fade-up">
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: '.25rem' }}>
        CALENDARIO
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem' }}>
        Entrenamientos, partidos y eventos
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'proximos', label: 'Próximos' },
          { key: 'pasados',  label: 'Pasados'  },
          { key: 'todos',    label: 'Todos'    },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              flex: 1, padding: '.55rem', borderRadius: 10, fontSize: 14, fontWeight: 500,
              border: `1px solid ${filtro === f.key ? 'var(--accent)' : 'var(--border)'}`,
              background: filtro === f.key ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
              color: filtro === f.key ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>Cargando...</p>
      ) : Object.keys(porMes).length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem', fontSize: 14 }}>
          No hay eventos en este período
        </p>
      ) : (
        Object.entries(porMes).map(([mes, evs]) => (
          <div key={mes} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '.75rem',
            }}>
              {mes}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {evs.map(ev => {
                const fecha = new Date(ev.fecha_hora)
                const esHoy = isToday(fecha)
                return (
                  <div key={ev.id} style={{
                    borderRadius: 14, overflow: 'hidden',
                    border: `1px solid ${esHoy ? TIPO_COLOR[ev.tipo] : 'var(--border)'}`,
                    background: esHoy ? TIPO_BG[ev.tipo] : 'var(--surface)',
                    opacity: isPast(fecha) && !esHoy ? .6 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Franja lateral de color */}
                      <div style={{
                        width: 4, flexShrink: 0,
                        background: TIPO_COLOR[ev.tipo],
                      }} />

                      <div style={{ flex: 1, padding: '1rem' }}>
                        {/* Tipo + hoy */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: 4 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: .5,
                            textTransform: 'uppercase', color: TIPO_COLOR[ev.tipo],
                          }}>{ev.tipo}</span>
                          {esHoy && (
                            <span className="badge badge-accent" style={{ fontSize: 10, padding: '1px 7px' }}>HOY</span>
                          )}
                          {ev.categoria && (
                            <span className="badge badge-gray" style={{ fontSize: 10 }}>{ev.categoria}</span>
                          )}
                        </div>

                        {/* Título */}
                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{ev.titulo}</p>

                        {/* Detalles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                            <Clock size={13} />
                            {format(fecha, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                          </div>
                          {ev.lugar && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                              <MapPin size={13} />
                              {ev.lugar}
                            </div>
                          )}
                          {ev.rival && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                              <Shield size={13} />
                              vs {ev.rival} · {ev.es_local ? 'Local' : 'Visitante'}
                              {ev.resultado && <span className="badge badge-green" style={{ fontSize: 11, marginLeft: 4 }}>{ev.resultado}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div style={{
                        padding: '1rem .9rem', textAlign: 'center',
                        fontFamily: 'var(--font-head)',
                        color: TIPO_COLOR[ev.tipo], flexShrink: 0,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                          {format(fecha, 'dd')}
                        </div>
                        <div style={{ fontSize: 11 }}>
                          {format(fecha, 'EEE', { locale: es }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}