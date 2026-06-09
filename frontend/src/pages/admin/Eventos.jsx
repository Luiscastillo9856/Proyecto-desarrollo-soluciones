import { useEffect, useState } from 'react'
import { Plus, X, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../services/api'

const TIPOS = ['entrenamiento','partido','torneo','reunion']
const TIPO_COLOR = {
  entrenamiento: 'var(--accent2)', partido: 'var(--accent)',
  torneo: 'var(--warning)', reunion: 'var(--text-muted)',
}

const formVacio = {
  tipo: 'entrenamiento', titulo: '', descripcion: '',
  fecha_hora: '', lugar: '', categoria_id: '', rival: '', es_local: '',
}

export default function Eventos() {
  const [eventos,   setEventos]   = useState([])
  const [modal,     setModal]     = useState(false)
  const [asistModal,setAsistModal]= useState(null) // evento seleccionado
  const [form,      setForm]      = useState(formVacio)
  const [editando,  setEditando]  = useState(null)
  const [filtro,    setFiltro]    = useState('todos')
  const [jugadores, setJugadores] = useState([])
  const [asist,     setAsist]     = useState([])   // asistencias del modal
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  const cargar = () =>
    api.get('/eventos').then(r => setEventos(r.data)).finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const filtrados = filtro === 'todos' ? eventos : eventos.filter(e => e.tipo === filtro)

  const abrirCrear  = () => { setForm(formVacio); setEditando(null); setError(''); setModal(true) }
  const abrirEditar = ev => {
    setForm({
      tipo: ev.tipo, titulo: ev.titulo, descripcion: ev.descripcion || '',
      fecha_hora: ev.fecha_hora?.slice(0,16) || '', lugar: ev.lugar || '',
      categoria_id: ev.categoria_id || '', rival: ev.rival || '',
      es_local: ev.es_local === true ? 'true' : ev.es_local === false ? 'false' : '',
    })
    setEditando(ev.id); setError(''); setModal(true)
  }

  const guardar = async e => {
    e.preventDefault(); setGuardando(true); setError('')
    try {
      const payload = {
        ...form,
        categoria_id: form.categoria_id || null,
        rival: form.rival || null,
        es_local: form.es_local === 'true' ? true : form.es_local === 'false' ? false : null,
      }
      if (editando) await api.put(`/eventos/${editando}`, payload)
      else          await api.post('/eventos', payload)
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally { setGuardando(false) }
  }

  const eliminar = async id => {
    if (!confirm('¿Eliminar este evento?')) return
    await api.delete(`/eventos/${id}`); cargar()
  }

  const abrirAsistencias = async ev => {
    const [jRes, evRes] = await Promise.all([
      api.get('/jugadores'),
      api.get(`/eventos/${ev.id}`),
    ])
    const jugsCat = ev.categoria_id
      ? jRes.data.filter(j => j.categoria === ev.categoria)
      : jRes.data
    setJugadores(jugsCat)
    const existentes = evRes.data.asistencias || []
    setAsist(jugsCat.map(j => {
      const ex = existentes.find(a => a.jugador_id === j.id)
      return { jugador_id: j.id, nombre: `${j.nombre} ${j.apellido}`, estado: ex?.estado || 'presente' }
    }))
    setAsistModal(ev)
  }

  const guardarAsistencias = async () => {
    await api.post(`/eventos/${asistModal.id}/asistencias`, {
      asistencias: asist.map(a => ({ jugador_id: a.jugador_id, estado: a.estado }))
    })
    setAsistModal(null)
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800 }}>EVENTOS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{eventos.length} eventos registrados</p>
        </div>
        <button className="btn btn-accent" onClick={abrirCrear}>
          <Plus size={16} /> Nuevo evento
        </button>
      </div>

      {/* Filtro por tipo */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {['todos', ...TIPOS].map(t => (
          <button
            key={t} onClick={() => setFiltro(t)}
            className="btn btn-ghost"
            style={{
              fontSize: 13, padding: '.4rem .9rem',
              background: filtro === t ? 'var(--surface2)' : 'transparent',
              color: filtro === t ? 'var(--text)' : 'var(--text-muted)',
              borderColor: filtro === t ? TIPO_COLOR[t] || 'var(--accent)' : 'var(--border)',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de eventos */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtrados.map(ev => (
            <div key={ev.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '1rem 1.25rem',
            }}>
              {/* Fecha */}
              <div style={{
                fontFamily: 'var(--font-head)', textAlign: 'center', minWidth: 52,
                color: TIPO_COLOR[ev.tipo],
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                  {format(new Date(ev.fecha_hora), 'dd')}
                </div>
                <div style={{ fontSize: 12 }}>
                  {format(new Date(ev.fecha_hora), 'MMM', { locale: es }).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: 2 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
                    color: TIPO_COLOR[ev.tipo],
                  }}>{ev.tipo}</span>
                  {ev.categoria && (
                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{ev.categoria}</span>
                  )}
                  {ev.resultado && (
                    <span className="badge badge-green" style={{ fontSize: 11 }}>
                      {ev.es_local ? 'Local' : 'Visitante'} · {ev.resultado}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ev.titulo}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {format(new Date(ev.fecha_hora), 'HH:mm')} · {ev.lugar || 'Sin lugar'}
                  {ev.rival && ` · vs ${ev.rival}`}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: '.35rem .7rem' }}
                  onClick={() => abrirAsistencias(ev)}
                >
                  <Users size={13} /> Asistencia
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '.35rem .7rem' }} onClick={() => abrirEditar(ev)}>
                  Editar
                </button>
                <button className="btn btn-danger" style={{ fontSize: 12, padding: '.35rem .7rem' }} onClick={() => eliminar(ev.id)}>
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No hay eventos de este tipo
            </div>
          )}
        </div>
      )}

      {/* Modal crear/editar evento */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>
                {editando ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
              </h2>
              <button className="btn btn-ghost" style={{ padding: '.35rem' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TIPO</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CATEGORÍA ID (opcional)</label>
                  <input type="number" value={form.categoria_id} onChange={e => setForm(f => ({...f, categoria_id: e.target.value}))} placeholder="Dejar vacío = todas" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TÍTULO</label>
                <input value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>FECHA Y HORA</label>
                  <input type="datetime-local" value={form.fecha_hora} onChange={e => setForm(f => ({...f, fecha_hora: e.target.value}))} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>LUGAR</label>
                  <input value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} />
                </div>
              </div>
              {form.tipo === 'partido' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>RIVAL</label>
                    <input value={form.rival} onChange={e => setForm(f => ({...f, rival: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>¿LOCAL?</label>
                    <select value={form.es_local} onChange={e => setForm(f => ({...f, es_local: e.target.value}))}>
                      <option value="">Sin definir</option>
                      <option value="true">Local</option>
                      <option value="false">Visitante</option>
                    </select>
                  </div>
                </div>
              )}
              {error && <div style={{ padding: '.7rem', borderRadius: 8, background: 'rgba(255,77,109,.1)', color: 'var(--danger)', fontSize: 14 }}>{error}</div>}
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal asistencias */}
      {asistModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>ASISTENCIA</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{asistModal.titulo}</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: '.35rem' }} onClick={() => setAsistModal(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.25rem' }}>
              {asist.map((a, i) => (
                <div key={a.jugador_id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '.6rem .75rem', borderRadius: 8, background: 'var(--surface2)',
                }}>
                  <span style={{ fontSize: 14 }}>{a.nombre}</span>
                  <select
                    value={a.estado}
                    onChange={e => setAsist(prev => prev.map((x, j) => j === i ? {...x, estado: e.target.value} : x))}
                    style={{ width: 140, padding: '.3rem .6rem' }}
                  >
                    <option value="presente">✅ Presente</option>
                    <option value="ausente">❌ Ausente</option>
                    <option value="justificado">📋 Justificado</option>
                    <option value="tarde">⏰ Tarde</option>
                  </select>
                </div>
              ))}
              {asist.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No hay jugadores en esta categoría.</p>}
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setAsistModal(null)}>Cancelar</button>
              <button className="btn btn-accent" onClick={guardarAsistencias} disabled={asist.length === 0}>
                Guardar asistencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}