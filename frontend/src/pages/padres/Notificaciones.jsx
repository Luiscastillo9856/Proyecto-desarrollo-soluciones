import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, CheckCheck } from 'lucide-react'
import api from '../../services/api'

const TIPO_COLOR = {
  cuota_vencida:  'var(--danger)',
  evento_proximo: 'var(--accent)',
  resultado:      'var(--accent2)',
  aviso_general:  'var(--text-muted)',
}
const TIPO_EMOJI = {
  cuota_vencida:  '💰',
  evento_proximo: '📅',
  resultado:      '⚽',
  aviso_general:  '📢',
}

export default function Notificaciones() {
  const [notifs,   setNotifs]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const { setNoLeidas } = useOutletContext()

  const cargar = () =>
    api.get('/notificaciones').then(r => setNotifs(r.data)).finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const marcarLeida = async id => {
    await api.patch(`/notificaciones/${id}/leer`)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    setNoLeidas(prev => Math.max(0, prev - 1))
  }

  const marcarTodas = async () => {
    await api.patch('/notificaciones/leer-todas')
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
  }

  const noLeidas = notifs.filter(n => !n.leida)

  return (
    <div style={{ padding: '1.5rem 1rem' }} className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: '.25rem' }}>
            AVISOS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {noLeidas.length > 0 ? `${noLeidas.length} sin leer` : 'Todo leído'}
          </p>
        </div>
        {noLeidas.length > 0 && (
          <button
            onClick={marcarTodas}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}
          >
            <CheckCheck size={16} /> Marcar todas
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>Cargando...</p>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Bell size={40} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No hay notificaciones aún</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.leida && marcarLeida(n.id)}
              style={{
                borderRadius: 14, padding: '1rem 1.1rem',
                background: n.leida ? 'var(--surface)' : 'var(--surface2)',
                border: `1px solid ${n.leida ? 'var(--border)' : TIPO_COLOR[n.tipo] || 'var(--border)'}`,
                cursor: n.leida ? 'default' : 'pointer',
                opacity: n.leida ? .7 : 1,
                transition: 'opacity .2s',
              }}
            >
              <div style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
                {/* Ícono tipo */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${TIPO_COLOR[n.tipo]}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {TIPO_EMOJI[n.tipo] || '🔔'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem' }}>
                    <p style={{ fontWeight: n.leida ? 500 : 700, fontSize: 14, lineHeight: 1.3 }}>
                      {n.titulo}
                    </p>
                    {!n.leida && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </div>
                  {n.mensaje && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                      {n.mensaje}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}