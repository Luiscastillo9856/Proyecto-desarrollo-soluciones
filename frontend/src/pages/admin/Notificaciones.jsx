import { useEffect, useState } from 'react'
import { Send, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../services/api'

const TIPOS = ['aviso_general','cuota_vencida','evento_proximo','resultado']
const TIPO_COLOR = {
  aviso_general: 'var(--text-muted)', cuota_vencida: 'var(--danger)',
  evento_proximo: 'var(--accent)', resultado: 'var(--accent2)',
}

const formVacio = { padre_ids: 'todos', tipo: 'aviso_general', titulo: '', mensaje: '' }

export default function Notificaciones() {
  const [notifs,   setNotifs]   = useState([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(formVacio)
  const [loading,  setLoading]  = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error,    setError]    = useState('')

  const cargar = () =>
    api.get('/notificaciones').then(r => setNotifs(r.data)).finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const enviar = async e => {
    e.preventDefault(); setEnviando(true); setError('')
    try {
      const payload = {
        ...form,
        padre_ids: form.padre_ids === 'todos' ? 'todos' : form.padre_ids.split(',').map(Number),
      }
      await api.post('/notificaciones', payload)
      setModal(false); setForm(formVacio); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar')
    } finally { setEnviando(false) }
  }

  const noLeidas = notifs.filter(n => !n.leida).length

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800 }}>NOTIFICACIONES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {notifs.length} enviadas · {noLeidas} no leídas
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => { setForm(formVacio); setError(''); setModal(true) }}>
          <Send size={15} /> Enviar notificación
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {notifs.map(n => (
            <div key={n.id} className="card" style={{
              padding: '1rem 1.25rem',
              borderLeft: `3px solid ${TIPO_COLOR[n.tipo] || 'var(--border)'}`,
              opacity: n.leida ? .6 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{n.titulo}</span>
                    {!n.leida && (
                      <span style={{
                        display: 'inline-block', width: 7, height: 7,
                        borderRadius: '50%', background: 'var(--accent)',
                      }} />
                    )}
                  </div>
                  {n.mensaje && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{n.mensaje}</p>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: .5, color: TIPO_COLOR[n.tipo] }}>
                      {n.tipo?.replace('_', ' ')}
                    </span>
                    {n.padre && <span> · Para: {n.padre}</span>}
                    <span> · {format(new Date(n.created_at), "d MMM yyyy, HH:mm", { locale: es })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {notifs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No hay notificaciones enviadas aún
            </div>
          )}
        </div>
      )}

      {/* Modal enviar */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>NUEVA NOTIFICACIÓN</h2>
              <button className="btn btn-ghost" style={{ padding: '.35rem' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>DESTINATARIOS</label>
                  <select value={form.padre_ids} onChange={e => setForm(f => ({...f, padre_ids: e.target.value}))}>
                    <option value="todos">Todos los padres</option>
                    <option value="">IDs específicos...</option>
                  </select>
                  {form.padre_ids !== 'todos' && (
                    <input
                      style={{ marginTop: 6 }}
                      placeholder="Ej: 1,2,3"
                      value={form.padre_ids}
                      onChange={e => setForm(f => ({...f, padre_ids: e.target.value}))}
                    />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TIPO</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
                    {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TÍTULO</label>
                <input value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} required placeholder="Ej: Entrenamiento cancelado" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>MENSAJE (opcional)</label>
                <textarea value={form.mensaje} onChange={e => setForm(f => ({...f, mensaje: e.target.value}))} rows={3} placeholder="Detalle de la notificación..." />
              </div>

              {error && <div style={{ padding: '.7rem', borderRadius: 8, background: 'rgba(255,77,109,.1)', color: 'var(--danger)', fontSize: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent" disabled={enviando}>
                  {enviando ? 'Enviando...' : <><Send size={14} /> Enviar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}